# INTEGRATION TEST - THREAD REPOSITORY: Generic Error Database

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

Saya menambahkan kasus pengujian error tersebut untuk mencegah terjadinya silent error seperti dibawah ini:

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
      // karena add thread use case melakukan pemeriksaan instance nilai yang dikembalikan,
      // dan akan melempar error jika bukan AddedThread entity, jadi hasilnya tetap 500
      // namun tetap kita membutuhkan pengujian error dalam konteks repository
      console.error(error);
    }
  }

  // Kode lainya... //
}

module.exports = ThreadRepositoryPostgres;
```

Kenapa saya tidak menetapkan error spesifik untuk pengujian ini:
1. __Konsistensi Error Sulit Dijamin__:

    Driver DB seperti `pg` biasanya mengembalikan error yang merupakan instance dari `Error` JS standar, tetapi properti dalamnya (seperti code atau detail) bergantung pada *PostgreSQL* itu sendiri. Error ini bukan *Error kustom* aplikasi (seperti `NotFoundError`), sehingga menguji tipe spesifik (misalnya `PgError`) dapat membuat tes rapuh (mudah rusak) jika driver DB diperbarui.

    Sama halnya jika ditetapkan pesan error spesifiknya seperti &mdash; *duplicate key value violates unique constraint "threads_pkey"* atau &mdash; *insert or update on table "threads" violates foreign key constraint "threads_owner_id_fkey"*. ini tidak akan memberi manfaat lebih, karena response 500 yang sampai ke client pesan errornya tetap &mdash; *terjadi kesalahan diserver kami*.
2. __Fokus Tes Integrasi__:

    Fokus pengujian adalah memastikan aliran eksekusi (propagation) dari __DB__ $\rightarrow$ __Repository__ benar. Selama *error* itu terlempar (thrown) dan tidak ditelan (silent), tujuannya tercapai.
3. __Filosofi Clean Architecture__:

    Repository tidak seharusnya bertanggung jawab mengubah DB error menjadi error spesifik aplikasi, kecuali untuk kasus yang sudah ditentukan seperti `NotFoundError`. Untuk DB error umum (constraint *unique*, *foreign key*, dll.), meneruskannya dalam bentuk DB error orisinal sudah benar.

## Perbaikan dan Peningkatan Pengujian

Untuk meningkatkan pengujian sebelumnya, saya menambahkan 1 assersi untuk mencegah error yang dilempar merupakan `ClientError`.
`ThreadRepositoryPostgres.integration.test.js`
```js
  describe('addThread', () => {

    // Kode lainya... //

    it('should propagate error when id is exists', async () => {

      // Kode lainya... //

      await expect(threadRepo.addThread(newThread))
        .rejects.toThrow();
      // assersi ini akan mencegah db error di olah menjadi client error
      await expect(threadRepo.addThread(newThread))
        .rejects.not.toThrow(ClientError);
    });

    it('should propagate error when owner not exists', async () => {

      // Kode lainya... //

      await expect(threadRepo.addThread(newThread))
        .rejects.toThrow();
      // assersi ini akan mencegah db error di olah menjadi client error
      await expect(threadRepo.addThread(newThread))
        .rejects.not.toThrow(ClientError);
    });
  });
```

Contoh kode yang mengolah db error menjadi client error:

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

      // disini error dari db akan ditangkap dan silent
      // lalu custom error dilempar
      // ini akan mengakibatkan response error ke klien bukan 500 Internal Server Error
      throw new InvariantError('terjadi kesalahan pada server kami.');
    }
  }

  // Kode lainya... //
}

module.exports = ThreadRepositoryPostgres;
```
