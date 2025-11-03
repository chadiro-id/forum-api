# Argumen Teknis: Implementasi Pengujian Error

Kasus: Pengujian pada skenario *resolve* tidak menetapkan error spesifik

## 1. Konteks

Reviewer meminta agar pengujian kasus sukses dan gagal menggunakan bentuk berikut:
```js
// Kasus resolve (berhasil)
await expect(threadRepo.verifyThreadExists('existent-id'))
  .resolves.not.toThrow(NotFoundError);

// Simetris dengan kasus kegagalan
await expect(threadRepo.verifyThreadExists('non-existent-id'))
  .rejects.toThrow(NotFoundError);
```
Namun, pendekatan tersebut tidak selalu tepat secara __semantik testing__, karena berpotensi membuat tes __lolos meski implementasi salah__.

## 2. Contoh Kasus

Berikut contoh implementasi yang salah, tetapi akan lolos dengan format uji yang diminta reviewer:
```js
async verifyThreadExists(id) {
  const query = {
    text: 'SELECT id FROM threads WHERE id = $1',
    values: [id],
  };

  const result = await this._pool.query(query);
  if (!result.rows.length) {
    throw new NotFoundError('Thread tidak ada, id tidak ditemukan');
  } else {
    // Kesalahan: selalu melempar AuthorizationError meski seharusnya tidak
    throw new AuthorizationError('Pengguna tidak berhak mengakses resource ini');
  }
}
```
Jika diuji dengan:
```js
await expect(repo.verifyThreadExists('existent-id'))
  .resolves.not.toThrow(NotFoundError);
```
Maka hasilnya akan __lolos__, karena fungsi melempar `AuthorizationError`, bukan `NotFoundError`.
Padahal fungsi tersebut __seharusnya tidak melempar error sama sekali__.

## 3. Pendekatan yang Lebih Tepat

Untuk kasus *resolve* (sukses), yang perlu dipastikan adalah bahwa __tidak ada error apa pun yang dilempar__:
```js
await expect(repo.verifyThreadExists('existent-id'))
  .resolves.not.toThrow();
```
Sementara untuk kasus gagal, tetap menggunakan error spesifik:
```js
await expect(repo.verifyThreadExists('nonexistent-id'))
  .rejects.toThrow(NotFoundError);
```

Dengan cara ini, maka pengujian:
- Fokus pada __intensi logis__:

    sukses = *tidak ada error*, gagal = *error jenis tertentu*

- Lebih tahan terhadap perubahan minor

- Tidak menimbulkan *false positive* saat error tipe lain muncul

## 4. Referensi Pendukung

> “A good unit test should assert the intended outcome, not the incidental implementation detail.”
>
> — *Martin Fowler, Unit Testing Principles (2018)*

## 5. Kesimpulan

- `resolves.not.toThrow()` pada kasus sukses __lebih semantik dan aman__.
- Pengujian dengan `resolves.not.toThrow(ErrorType)` bisa menimbulkan *false positive*.
- Pendekatan ini memastikan test lebih kuat, lebih jelas, dan tidak rapuh terhadap perubahan minor implementasi.

## 6. Penutup

Pendekatan yang digunakan pada kode dan pengujian ini sesuai dengan praktik unit testing yang baik.
Dengan demikian, implementasi pengujian ini dapat dipertahankan secara profesional.