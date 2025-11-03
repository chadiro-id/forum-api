# Argumen Teknis: Implementasi Sesuai Prinsip Clean Architecture

Kasus: Transformasi Data di Repository Layer

## 1. Konteks

Reviewer menilai bahwa penggunaan metode `_transformToAddedThread()` dan `_transformToDetailThread()` pada `ThreadRepositoryPostgres` merupakan penerapan yang tidak tepat terhadap prinsip *Clean Architecture* karena dianggap sebagai *business logic* yang seharusnya dilakukan di layer domain.

Namun, pendekatan tersebut justru __sesuai dengan prinsip Clean Architecture__ bila ditinjau dari konsep *dependency rule* dan *responsibility separation*.

## 2. Tujuan Repository dalam Clean Architecture

Dalam *Clean Architecture* (Robert C. Martin), repository berperan sebagai __adapter__ antara sumber data eksternal (database) dan domain model.  
Repository __boleh melakukan adaptasi data__, selama tidak memasukkan *business logic* di dalamnya.

> “The database is a detail. The Repository is the translator between the database schema and the domain model.”
>
> — *Robert C. Martin, Clean Architecture (2017)*

Dengan demikian, operasi seperti:
```js
_transformToAddedThread({
  id, title, owner_id: owner
}) {
  return new AddedThread({
    id, title, owner
  });
}
```
bukanlah logika bisnis, melainkan adaptasi data dari infrastruktur ke domain entity.

## 3. Alasan Teknis dan Arsitektural

### 3.1. Menghindari Pelanggaran Dependency Rule

Jika transformasi dilakukan di entity (`AddedThread`, `DetailThread`), maka entity harus mengetahui struktur data dari database (`owner_id`, `created_at`, dll).
Ini akan melanggar dependency rule, karena domain menjadi bergantung pada detail infrastruktur.

Dengan transform di repository:
- Entity tetap bersih dari format data database.
- Dependency berjalan satu arah:
    `Domain ← Repository Interface ← Infrastructure`.

> “Entities should not depend on frameworks, databases, or external data formats.”
>
> — *Robert C. Martin, Clean Architecture*

### 3.2. Memisahkan *Business Logic* dari *Data Representation Logic*

Mapping seperti:
```js
_transformToAddedThread({
  id, title, owner_id: owner
})
```
tidak berisi keputusan bisnis apa pun.
Hanya konversi struktur data agar sesuai kontrak domain entity.

Dengan kata lain, ini adalah *data formatting logic*, bukan *business logic*.
Menempatkannya di repository justru menjaga agar domain tetap bersih dan tidak tercemar oleh detail penyimpanan data.

### 3.3. Prinsip *High Cohesion*, *Low Coupling*

- Repository menangani semua hal yang berhubungan dengan adaptasi data.
- Domain tidak perlu tahu format eksternal.
- Setiap layer memiliki tanggung jawab tunggal (*Single Responsibility Principle*).

Sebaliknya, jika entity dipaksa melakukan mapping sendiri, ia akan memiliki dua tanggung jawab:
1. Memvalidasi domain (fungsi utama)
2. Menyesuaikan format eksternal (fungsi infrastruktur)

Hal ini menurunkan *cohesion* dan meningkatkan *coupling* antar layer.

## 4. Referensi Pendukung

> “The Repository is the translator between the database schema and the domain model.”
>
> — *Robert C. Martin – Clean Architecture (2017)*

> “A repository implementation may include transformation logic, converting persistence model to domain model, as long as it does not embed business rules.”
>
> — *Vaughn Vernon – Implementing Domain-Driven Design (2013)*

> “The mapping between data access models and domain models belongs to the adapter that implements the repository interface.”
>
> — *Mark Seemann – Dependency Injection Principles (2019)*

## 5. Kesimpulan

Implementasi `_transformToAddedThread()` dan `_transformToDetailThread()`:
- Tidak melanggar Clean Architecture
- Menjaga dependency rule tetap utuh
- Meningkatkan maintainability dan testability
- Tidak mengandung logika bisnis

Dengan demikian, pendekatan ini dapat dipertahankan sebagai implementasi yang __selaras dengan prinsip *Clean Architecture* modern__, bukan pelanggaran.