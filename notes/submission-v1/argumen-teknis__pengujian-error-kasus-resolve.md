# ARGUMEN TEKNIS: Pengujian Error Kasus Resolve

## 1. Konteks Pengujian: verifyThreadExists (Kasus Resolve)

`ThreadRepositoryPostgres.js`
```js
async verifyThreadExists(id) {
  const query = {
    text: 'SELECT id FROM threads WHERE id = $1',
    values: [id],
  };

  const result = await this._pool.query(query);
  if (!result.rows.length) {
    throw new NotFoundError('Thread tidak ada, id tidak ditemukan');
  }
}
```

`ThreadRepositoryPostgres.integration.test.js`
```js
describe('verifyThreadExists', () => {
  it('should correctly resolve and not throw error', async () => {
    await pgTest.threads.add({ owner_id: user.id });

    // -- Catatan Reviewer --
    // Spesifikan jenis error apa yang seharusnya muncul / tidak muncul saat melakukan assert menggunakan method toThrow().
    // Misal NotFoundError / AuthorizationError / dsb.
    // Sesuaikan untuk test case lain yang serupa.
    await expect(threadRepo.verifyThreadExists('thread-001'))
      .resolves
      .not.toThrow();
  });

  it('should throw NotFoundError when id not exists', async () => {
    await expect(threadRepo.verifyThreadExists('nonexistent-thread-id'))
      .rejects
      .toThrow(NotFoundError);
  });
});
```

## 2. Pertimbangan Teknis: Pengujian pada Kasus Promise Resolve

Kami memahami permintaan untuk spesifikasi *error* pada *assertion* `toThrow()`. Namun, untuk kasus *resolve* (`.resolves`), kami mempertahankan implementasi __generik__ (yaitu `.resolves.not.toThrow()`).

### 2.1. Redundansi pada Assertion Resolve

Dalam konteks Jest, `await expect(promise).resolves` hanya berhasil jika *Promise* berhasil diselesaikan (*fulfilled*). Kondisi ini secara __mutlak__ berarti *Promise* tidak melempar *error* apapun.

- Menambahkan `.not.toThrow()` hanyalah penegasan semantik.
- Menambahkan spesifikasi *error* (misalnya `NotFoundError` atau `AuthorizationError`) pada *assertion* `.resolves.not.toThrow(SpecificError)` __tidak memberikan nilai pengujian tambahan__ karena pada saat *resolve* berhasil, tidak ada *error* apapun yang berada di *pipeline* untuk diperiksa.

Berikut contoh variasi kode pada kasus *resolve* yang secara teknis itu sama:
```js
it('should resolve', async () => {
  // Simple, karena verifyThreadExists tidak menentukan nilai kembali secara eksplisit saat resolve
  // Sehingga nilai kembalinya undefined secara implisit
  await threadRepo.verifyThreadExists('thread-001');

  // Menggunakan promise dan penegasan nilai kembali
  await threadRepo.verifyThreadExists('thread-001').then((result) => expect(result).toBeUndefined());
  // Menggunakan resolves matcher dan penegasan nilai kembali
  await expect(threadRepo.verifyThreadExists('thread-001')).resolves.toBeUndefined();

  // Menggunakan resolves matcher dan penegasan semantik,
  // karena pada dasarnya kita tidak membutuhkan nilai kembali dari fungsi ini, cukup resolves
  await expect(threadRepo.verifyThreadExists('thread-001')).resolves.not.toThrow();

  // Menggunakan resolves matcher dan penegasan semantik
  // Serta menambahkan tipe error nya agar simetris dengan kasus reject
  await expect(threadRepo.verifyThreadExists('thread-001')).resolves.not.toThrow(WhateverError);

  // kita juga bisa menggunakan return
  return threadRepo.verifyThreadExists('thread-001');
  return expect(threadRepo.verifyThreadExists('thread-001')).resolves.not.toThrow();
  return expect(threadRepo.verifyThreadExists('thread-001')).resolves.not.toThrow(WhateverError);
});
```

### 2.2. Fokus pada Fail Case (rejects)

Fokus untuk spesifikasi *error* harus diletakkan pada kasus __gagal__ (`.rejects`):

| Skenario | Implementasi | Keterangan |
| :--- | :--- | :--- |
| __Gagal__ (Reject) | `await expect(...).rejects.toThrow(NotFoundError);` | __Tepat.__ Memastikan *error* yang dilempar adalah tipe yang benar. |
| __Berhasil__ (Resolve) | `await expect(...).resolves;` | __Tepat.__ Cukup menguji bahwa *Promise* berhasil diselesaikan. |

## 3. Perbaikan Deskripsi Test Case (Self-Correction)

Menyambung pada poin redundansi teknis pada *resolve case*, kami melakukan perbaikan pada deskripsi *test case* yang menguji jalur sukses (resolve):

- __Deskripsi Sebelumnya:__ `it('should correctly resolve and not throw error', ...)`
- __Deskripsi Perbaikan:__ `it('should resolves when thread exists', ...)`

__Justifikasi Perubahan:__

Deskripsi tes yang baik harus fokus pada __perilaku yang diharapkan (*expected behavior*)__ dan __tujuan bisnis__ dari fungsi yang diuji, bukan pada detail *assertion* teknis.

1.  __Menghilangkan Redundansi Bahasa:__ Frasa `"and not throw error"` adalah redundan pada kasus `resolves`, dan justru __mengalihkan fokus__ pembaca (mungkin termasuk *reviewer*) ke *assertion* (`.not.toThrow()`) yang tidak relevan.
2.  __Menegaskan Tujuan Bisnis:__ Deskripsi baru (`'should resolves when thread exists'`) secara eksplisit menyatakan __syarat keberhasilan__ dari fungsi `verifyThreadExists`, yaitu __keberadaan data__ di DB. Ini memastikan bahwa *test case* tersebut benar-benar menguji persyaratan *Domain Layer* (use case yang memanggil fungsi).

Perubahan ini bersifat *self-correction* untuk meningkatkan __keterbacaan (*readability*)__ dan __kejelasan tujuan__ dari pengujian jalur sukses, sejalan dengan prinsip-prinsip *Clean Code* dalam pengujian.

## 4. Kesimpulan

Kami memastikan bahwa fungsi `verifyThreadExists` berhasil di-*resolve* tanpa melempar *error* apapun saat data ditemukan. Tidak diperlukan spesifikasi *error* pada *resolve case* karena hal itu tidak menambah kekuatan pengujian secara teknis.