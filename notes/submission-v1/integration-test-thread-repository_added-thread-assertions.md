# INTEGRATION TEST - THREAD REPOSITORY: Justifikasi Assersi Lengkap

Tujuan: Memperkuat argumen bahwa assersi lengkap diperlukan untuk menguji integritas data.

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

Skenario kesalahan yang mungkin terjadi:
- __Kesalahan penyediaan properti entity__: AddedThread memiliki sistem validasi yang akan menolak jika tidak diberikan properti dengan benar, misal `owner_id` di mapping ke `userId` entity akan melempar error.
- __Kesalahan *value* yang di berikan__: AddedThread tidak memiliki kemampuan validasi nilai yang diberikan sesuai atau tidak dengan data yang di-*insert* ke DB. Jika nilai *title* diambil dari field *body* (`{id, body: title, owner_id: owner}`), ini akan tetap lolos validasi entity. Begitu juga dengan hardcode saat memanggil transformer `this._transformToAddedThread({ id: 'thread-xxx', title, owner_id: owner })`. Meskipun kesalahan ini terlihat konyol, namun memang bisa saja terjadi.

### Pengolahan Data

Berkaca dari kesalahan yang mungkin terjadi pada transformer, skenario konyol seperti dibawah ini juga bisa terjadi:
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

## Justifikasi Perubahan Assertions

Pada tahap *review* sebelumnya, *assertion* pada `addedThread` dan hasil raw DB (persisted thread) dianggap kurang lengkap. Perbaikan ini bertujuan untuk memastikan **integritas data** di seluruh lapisan *repository*.

### Skenario Potensial Kesalahan (Justifikasi Assertion Lengkap)

1.  __Kesalahan Pemetaan *Transformer*__:
    - Jika `_transformToAddedThread` salah memetakan *field* hasil query DB (misalnya, mengambil kolom `body` sebagai `title`), *assertion* pada `addedThread` akan gagal.
2.  __Kesalahan Penyisipan (*Insertion Error*)__:
    - Jika terjadi kesalahan pada *repository* di mana nilai yang di-*insert* ke DB berbeda dengan nilai dari `newThread` (misalnya, *hardcode* nilai atau salah memetakan *field* dalam query), *assertion* pada *persisted thread* akan gagal.
    - Cukup memeriksa eksistensi data (`toHaveLength(1)`) __tidak menjamin nilai__ yang di-*insert* sudah benar.

### Perbaikan Pengujian (Assertions Lengkap)

Kami melengkapi *assertion* untuk memverifikasi nilai dari setiap *field*:

Sebelum:
```js
// added thread
const addedThread = await threadRepo.addThread(newThread);
// persisted thread
const thread = await pgTest.threads.findById('thread-123');

// Assersi persisted thread hanya memeriksa eksistensi
expect(thread).toHaveLength(1);

expect(addedThread).toBeInstanceOf(AddedThread);
// Assersi properti added thread tidak lengkap.
expect(addedThread.id).toEqual('thread-123');
```

Sesudah:
```js
// Assersi persisted thread meng-expect semua fields untuk menguji integritas data yang di-persist
expect(thread).toHaveLength(1);
expect(thread[0]).toEqual(expect.objectContaining({
  id: 'thread-123',
  title: newThread.title,
  body: newThread.body,
  owner_id: newThread.owner,
}));
expect(Date.parse(thread[0].created_at)).not.toBeNan();

expect(addedThread).toBeInstanceOf(AddedThread);
// Assersi properti added thread dilengkapi untuk menguji logika transformasi data.
expect(addedThread).toEqual(expect.objectContaining({
  id: 'thread-123',
  title: newThread.title,
  owner: newThread.owner,
}));
```

## PENUTUP

Perbaikan ini memastikan bahwa fungsi `addThread` tidak hanya berhasil menyimpan data, tetapi juga menjaga __integritas nilai__ dari data yang di-*persist* ke DB dan data yang di-*return* sebagai `AddedThread` entity.