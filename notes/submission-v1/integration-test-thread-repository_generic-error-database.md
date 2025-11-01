# INTEGRATION TEST - THREAD REPOSITORY: Generic Error Propagation

Tujuan: Mempertahankan keputusan untuk tidak menguji *error* spesifik DB (seperti pesan *error* PostgreSQL) dan fokus pada *error propagation* yang benar (500 vs 4xx).

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
    return this._transformToAddedThread(result.rows[0]);
  }

  // Kode lainya... //
}

module.exports = ThreadRepositoryPostgres;
```

## Skenario Pengujian

`ThreadRepositoryPostgres.integration.test.js`
```js
  describe('addThread', () => {

    // Kode lainya... //

    it('should propagate error when id is exists', async () => {

      // saya insert data thread ke db dengan id thread-123
      // agar tabel thread terisi data thread dengan id tersebut
      await pgTest.threads.add({ id: 'thread-123', owner_id: user.id });

      const newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        owner: user.id,
      });

      // saat addThread dipanggil, repo akan insert new thread dengan id thread-123
      // karena saya stub idGeneratornya seperti ini:
      // threadRepo = new ThreadRepositoryPostgres(pgTest.getPool(), () => '123');
      // dengan ini maka db akan error, karena thread_id merupakan primary key,
      // maka module pg akan meneruskan error tersebut,
      // dan error tersebut memang semestinya tidak perlu kita olah,
      // melainkan kita teruskan juga, agar hapi yang menangani error ini,
      // karena error ini  bukan klien atau app,
      // melainkan error sistem yang memang seharusnya terjadi,,
      // jadi memang semestinya error yang dikembalikan ke klien itu 500 internal server error,
      await expect(threadRepo.addThread(newThread))
        .rejects.toThrow();
    });

    it('should propagate error when owner not exists', async () => {
      
      // disini saya asal menuliskan value untuk owner (user id)
      // dan sebenernya diisi apa saja pun boleh,
      // yang terpenting di db users tidak terdapat data dengan id tersebut
      // karena ini memang skenario untuk kegagalan dalam insert thread ke db,
      // sebagai pengingat, kolom owner_id dalam thread itu foreign key
      // yang merujuk ke users(id), yang artinya:
      // ketika kita insert ke tabel threads,
      // db akan memeriksa value owner_id apakah ada data di tabel users dengan id tersebut,
      // jika tidak ada, maka db akan error,
      // dan selanjutnya, sama seperti yang saya jelaskan sebelumnya di atas.
      const newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        owner: 'nonexistent-user-id',
      });

      await expect(threadRepo.addThread(newThread))
        .rejects.toThrow();
    });
  });
```

## Pertimbangan Pengujian

Skenario pengujian kasus error disini adalah untuk mencegah terjadinya silent error seperti contoh dibawah ini:

`ThreadRepositoryPostgres.js`
```js
// require dependency yang dibutuhkan... //

class ThreadRepositoryPostgres extends ThreadRepository {

  // Kode lainya... //

  async addThread(newThread) {
    // block try catch
    try {
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
      return this._transformToAddedThread(result.rows[0]);
    } catch (error) {
      // disini error dari db akan ditangkap dan ditelan.
      // maka addThread ini akan mengembalikan undefined,
      // sebenernya ini tidak berpengaruh ke response untuk klien
      // karena AddThreadUseCase melakukan pemeriksaan instance nilai yang dikembalikan,
      // dan akan melempar error jika bukan AddedThread entity, jadi hasilnya tetap 500
      // namun tetap membutuhkan pengujian error dalam konteks repository
      console.error(error);
    }
  }

  // Kode lainya... //
}

module.exports = ThreadRepositoryPostgres;
```

## Justifikasi Pengujian Error DB (Propagasi Generik)

Pengujian ini memastikan bahwa *system error* yang berasal dari DB (seperti *Primary Key* atau *Foreign Key Constraint Violation*) di-*propagate* dengan benar oleh *Repository* dan tidak diolah menjadi *client error*.

### Argumen Melawan Assertion Error Spesifik

Kami menolak untuk menguji pesan *error* spesifik DB (misalnya, `duplicate key value violates unique constraint...`) karena:

1.  __Kerapuhan Tes (*Test Brittleness*)__: Pesan *error* DB atau *instance* *error* dari *driver* (`pg`) bergantung pada versi yang digunakan. Menguji pesan spesifik membuat tes **rapuh** dan mudah rusak tanpa perubahan pada logika bisnis.
2.  __Filosofi *Error Handling*__: Dalam *Clean Architecture*, *Repository* hanya bertanggung jawab menerjemahkan DB *error* menjadi *Error* aplikasi yang sudah ditentukan (misalnya, `NotFoundError`). Untuk *error* sistem umum seperti *Constraint Violation*, *Repository* harus __meneruskan (*propagate*) error orisinal__.
3.  __Hanya 500 *Internal Server Error*__: *Error* sistem ini seharusnya menghasilkan *response* 500 bagi klien. Menguji pesan *error* spesifik tidak memberikan manfaat karena pesan tersebut akan disembunyikan dalam *response* 500.

### Perbaikan Pengujian (Fokus pada Propagation dan Tipe Error)

Perbaikan difokuskan untuk memastikan *error* terlempar, dan tipe *error* yang terlempar __bukanlah *ClientError*__ (4xx), yang merupakan pengolahan yang salah di lapisan *Repository*.

`ThreadRepositoryPostgres.integration.test.js`
```js
  describe('addThread', () => {

    // Kasus: ID sudah ada (Primary Key Violation)
    it('should propagate error when id is exists', async () => {

      // ...setup //

      await expect(threadRepo.addThread(newThread))
        .rejects.toThrow();
      // Memastikan error DB tidak diolah menjadi 4xx ClientError
      await expect(threadRepo.addThread(newThread))
        .rejects.not.toThrow(ClientError);
    });

    // Kasus: Owner tidak ada (Foreign Key Violation)
    it('should propagate error when owner not exists', async () => {

      // ...setup //

      await expect(threadRepo.addThread(newThread))
        .rejects.toThrow();
      // Memastikan error DB tidak diolah menjadi 4xx ClientError
      await expect(threadRepo.addThread(newThread))
        .rejects.not.toThrow(ClientError);
    });
  });
```

Contoh kode yang mengolah *DB Error* menjadi *Client Error*:

`ThreadRepositoryPostgres.js`
```js
// require dependency yang dibutuhkan... //

class ThreadRepositoryPostgres extends ThreadRepository {

  // Kode lainya... //

  async addThread(newThread) {
    // block try catch
    try {
      // Kode interaksi dengan database...
    } catch (error) {
      console.error(error);

      // disini error dari db ditangkap dan di silent
      // lalu custom error dilempar
      // ini akan mengakibatkan response error ke klien bukan 500 melainkan 400
      throw new InvariantError('terjadi kesalahan pada server kami.');
    }
  }

  // Kode lainya... //
}

module.exports = ThreadRepositoryPostgres;
```

## PENUTUP

Pengujian yang diperbaiki memastikan bahwa *Repository* menangani *error* sistem sesuai dengan *best practice* __error propagation__, mempertahankan *robustness* tes integrasi dengan menghindari *assertion* yang rapuh, dan mencegah *error* sistem dikonversi secara tidak tepat menjadi `ClientError`.
