# Forum API

Sebuah REST API forum (Node.js + Hapi) yang terstruktur mengikuti prinsip Clean Architecture.

## Ringkasan
- Menjalankan server: lihat [package.json](package.json) scripts (`start`, `start:dev`).
- Server dibuat di: [`src/app.js`](src/app.js) -> [`src/Infrastructures/http/server.js`](src/Infrastructures/http/server.js).
- Dependency injection / container ada di: [`src/Infrastructures/container/index.js`](src/Infrastructures/container/index.js).
- Token manager abstraksi: [`AuthenticationTokenManager`](src/Applications/security/AuthenticationTokenManager.js) dan implementasi JWT: [`JwtTokenManager`](src/Infrastructures/security/JwtTokenManager.js).
- Konfigurasi aplikasi: [`src/Commons/config.js`](src/Commons/config.js).

## Persyaratan
- Node.js (LTS)
- PostgreSQL (dengan konfigurasi di `.env` / `.env.test`)
- npm

## Instalasi
1. Clone repo.
   ```sh
   https://github.com/chadiro-id/forum-api.git
   ```
2. Install dependency:
   ```sh
   npm install
   ```
3. Salin file environment:
   ```sh
   cp .env.example .env
   # atau untuk test
   cp .env.test .env.test
   ```
   Edit nilai variabel (DB, token keys, port, dll) sesuai kebutuhan. File contoh: [.env.example](.env.example) dan [.env.test](.env.test).

## Menjalankan database migration
- Untuk environment default:
  ```sh
  npm run migrate
  ```
- Untuk environment test (menggunakan `.env.test`):
  ```sh
  npm run migrate:test
  ```
Migrations berada di folder [database/migrations](database/migrations).

## Menjalankan server
- Produksi / normal:
  ```sh
  npm run start
  ```
- Development (nodemon):
  ```sh
  npm run start:dev
  ```

Server bootstrap ada di [`src/app.js`](src/app.js) yang memanggil [`createServer` di src/Infrastructures/http/server.js](src/Infrastructures/http/server.js).

## Tes
- Semua tes:
  ```sh
  npm test
  ```
- Unit tests:
  ```sh
  npm run test:unit
  ```
- Integration tests:
  ```sh
  npm run test:integration
  ```
- Mode watch / coverage sesuai script di [package.json](package.json).

Setup & helper untuk testing tersedia di `tests/helper` (contoh: `tests/helper/authenticationHelper.js`, `tests/helper/postgres/*`).

## Struktur folder utama
- src/
  - Applications/ — use cases & abstractions untuk service
  - Domains/ — entitas dan repository interface (boundary)
  - Infrastructures/ — implementasi (DB, security, http server, container)
    - container/ — pendaftaran dependensi container ([src/Infrastructures/container/](src/Infrastructures/container/))
    - http/ — Hapi server, routes, handlers
    - repository/ — implementasi repositori Postgres
    - security/ — hashing & token manager ([JwtTokenManager](src/Infrastructures/security/JwtTokenManager.js))
    - validator/ — payload validation
  - Interfaces/ — plugin Hapi untuk tiap resource (users, threads, comments, replies, authentications)
  - Commons/ — config & exceptions ([src/Commons/config.js](src/Commons/config.js))
- tests/ — helper & util untuk testing
- database/ — migrations & configs

## Perhatian / catatan pengembangan
- Konfigurasi token diambil dari [`src/Commons/config.js`](src/Commons/config.js) — untuk kemudahan testing dan kebersihan arsitektur sebaiknya nilai sensitif (keys) dikirim lewat container (injeksi) ke implementasi seperti [`JwtTokenManager`](src/Infrastructures/security/JwtTokenManager.js).
- Jika butuh debug/lihat alur pendaftaran dependensi, lihat [`src/Infrastructures/container/index.js`](src/Infrastructures/container/index.js) dan container option di [`src/Infrastructures/container/*`](src/Infrastructures/container/).

## Lint
- Jalankan ESLint:
  ```sh
  npm run lint
  npm run lint:fix
  ```

## Troubleshooting singkat
- Test integration gagal: pastikan Postgres berjalan dan `.env.test` berisi konfigurasi DB yang benar, lalu jalankan migrasi test (`npm run migrate:test`).
- Jika terjadi error autentikasi/token, periksa kunci di `.env` / `.env.test` dan implementasi token manager: [`AuthenticationTokenManager`](src/Applications/security/AuthenticationTokenManager.js) / [`JwtTokenManager`](src/Infrastructures/security/JwtTokenManager.js).
