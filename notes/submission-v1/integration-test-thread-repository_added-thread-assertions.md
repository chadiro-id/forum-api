# INTEGRATION TEST - THREAD REPOSITORY: AddedThread assertions

## Konteks Pengujian

`ThreadRepositoryPostgres.js`
```js
// require dependency yang dibutuhkan... //

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool,
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;

    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: `
      INSERT INTO threads
        (id, title, body, owner_id)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id, title, owner_id
      `,
      values: [id, title, body, owner]
    };

    const result = await this._pool.query(query);
    // mengembalikan added thread entity hasil transform raw data db.
    return this._transformToAddedThread(result.rows[0]);
  }

  // Kode lainya... //

  // fungsi untuk transformasi raw db ke added thread entity
  _transformToAddedThread({
    id, title, owner_id: owner
  }) {
    return new AddedThread({
      id, title, owner
    });
  }

  // Kode lainya... //
}

module.exports = ThreadRepositoryPostgres;
```

`AddedThread.js`
```js
class AddedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const { id, title, owner } = payload;

    if (!id || !title || !owner) {
      throw new Error('ADDED_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof title !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('ADDED_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddedThread;
```

## Kode Pengujian

`ThreadRepositoryPostgres.integration.test.js`
```js
// Kode lainya...

describe('addThread', () => {
  it('should correctly persist the NewThread and return AddedThread', async () => {
    const newThread = new NewThread({
      title: 'Sebuah thread',
      body: 'Isi thread',
      owner: user.id,
    });

    const addedThread = await threadRepo.addThread(newThread);

    const thread = await pgTest.threads.findById('thread-123');
    // Assersi raw thread dari db hanya memeriksa eksistensi
    expect(thread).toHaveLength(1);

    expect(addedThread).toBeInstanceOf(AddedThread);
    // Assersi property added thread tidak lengkap.
    expect(addedThread.id).toEqual('thread-123');
  });
});

// Kode lainya...
```

## Alur Eksekusi Kode

Alur eksekusi secara ringkas:
1. `addThread()` dipanggil dengan argument `NewThread` entity.
2. `addThread()` mengolah data yang akan di insert ke db.
3. `addThread()` memanggil pool.query untuk insert ke db.
4. `addThread()` memanggil fungsi `_transformToAddedThread()`.
5. `addThread()` mengembalikan `AddedThread` entity yang merupakan nilai kembali dari `_transformToAddedThread`.

Beberapa kesalahan yang mungkin terjadi dalam alur eksekusi.

### Transformer

Fungsi added thread transformer:
```js
// fungsi menerima payload dengan properti id, title, owner_id
// dan selanjutnya owner_id di petakan ke owner.
_transformToAddedThread({
  id, title, owner_id: owner
}) {
  // Entitas AddedThread menerima payload dengan properti id, title, owner
  return new AddedThread({
    id, title, owner
  });
}
```

Skenario yang mungkin terjadi:
- __Kesalahan penyediaan properti entity__: AddedThread memiliki sistem validasi yang akan menolak jika tidak diberikan properti dengan benar, misal `owner_id` di mapping ke `userId` entity akan melempar error.
- __Kesalahan *value* yang di berikan__: AddedThread tidak memiliki kemampuan validasi nilai yang diberikan sesuai atau tidak dengan data di db. Jika nilai *title* diambil dari field *body* (`{id, body: title, owner_id: owner}`), ini akan tetap lolos validasi entity. Begitu juga dengan hardcode saat memanggil transformer `this._transformToAddedThread({ id: 'thread-xxx', title, owner })`. Meskipun kesalahan ini terlihat konyol, namun memang bisa saja terjadi.

### Pengolahan Data

Berkaca dari kesalahan yang mungkin terjadi pada transformer, saya pun jadi terpikir skenario konyol seperti ini:
```js
async addThread(newThread) {
  const { title, body, owner } = newThread;

  const id = `thread-${this._idGenerator()}`;
  const judul = 'thread title'; // variabel untuk title

  const query = {
    text: `
    INSERT INTO threads
      (id, title, body, owner_id)
    VALUES
      ($1, $2, $3, $4)
    `,
    // input untuk title diambil dari variabel judul
    values: [id, judul, body, owner]
  };

  await this._pool.query(query);
  
  // disini terjadi perbedaan nilai title yang di transform dengan yang di input ke db
  return this._transformToAddedThread({ id, title, owner_id: owner });
}
```

## Perbaikan Pengujian

Menimbang beberapa skenario kesalahan yang mungkin terjadi, saya melakukan perbaikan pada assersi __added thread__ dan juga __persisted thread__.

Sebelum:
```js
// added thread
const addedThread = await threadRepo.addThread(newThread);
// persisted thread
const thread = await pgTest.threads.findById('thread-123');

// Assersi persisted thread hanya memeriksa eksistensi
expect(thread).toHaveLength(1);

expect(addedThread).toBeInstanceOf(AddedThread);
// Assersi property added thread tidak lengkap.
expect(addedThread.id).toEqual('thread-123');
```

Sesudah:
```js
// Assersi persisted thread meng-expect fields
expect(thread).toHaveLength(1);
expect(thread[0]).toEqual(expect.objectContaining({
  id: 'thread-123',
  title: newThread.title,
  body: newThread.body,
  owner_id: newThread.owner,
}));

expect(addedThread).toBeInstanceOf(AddedThread);
// Assersi property added thread dilengkapi.
expect(addedThread).toEqual(expect.objectContaining({
  id: 'thread-123',
  title: newThread.title,
  owner: newThread.owner,
}));
```

## PENUTUP

Terimakasih atas review dan saran yang diberikan.
Tentu masih banyak kekurangan dari project yang saya kerjakan,
seperti integration test yang belum optimal karena harus dijalankan sekuential (mode `--runInBand`).
Dan masih banyak hal lainya.

Sekian dan terimakasih.