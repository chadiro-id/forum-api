# Kriteria Wajib Forum API

Terdapat 6 kriteria utama dalam membuat proyek __Forum API__.

## 1. Menambahkan Thread

API harus dapat menambahkan thread melalui *route*:
- Method: __POST__
- Path: __/threads__
- Body Request:
    ```json
    {
        "title": "string",
        "body": "string",
    }
    ```

Response yang harus dikembalikan:
- Status Code: __201__
- Response Body:
    ```json
    {
        "status": "success",
        "data": {
            "addedThread": {
                "id": "thread-h_W1Plfpj0TY7wyT2PUPX",
                "title": "sebuah thread",
                "owner": "user-DWrT3pXe1hccYkV1eIAxS"
            }
        }
    }
    ```

__Ketentuan:__
- Menambahkan __thread__ merupakan *resource* yang dibatasi (*restrict*). Untuk mengaksesnya membutuhkan *access token* guna mengetahui siapa yang membuat __thread__.
- Jika properti *body request* tidak lengkap atau tidak sesuai, maka:
    - Kembalikan dengan *status code* __400__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai

## 2. Menambahkan Komentar pada Thread

API harus dapat menambahkan __komentar__ pada *thread* melalui *route*:
- Method: __POST__
- Path: __/threads/{threadId}/comments__
- Body Request:
    ```json
    {
        "content": "string",
    }
    ```

Response yang harus dikembalikan:
- Status Code: __201__
- Response Body:
    ```json
    {
        "status": "success",
        "data": {
            "addedComment": {
                "id": "comment-_pby2_tmXV6bcvcdev8xk",
                "content": "sebuah comment",
                "owner": "user-CrkY5iAgOdMqv36bIvys2"
            }
        }
    }
    ```

__Ketentuan:__
- Menambahkan __komentar__ pada *thread* merupakan resource yang dibatasi (*restrict*). Untuk mengaksesnya membutuhkan *access token* guna mengetahui siapa yang membuat komentar.
- Jika __thread__ yang diberi *komentar* tidak ada atau tidak valid, maka:
    - Kembalikan dengan *status code* __404__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai
- Jika properti *body request* tidak lengkap atau tidak sesuai, maka:
    - Kembalikan dengan *status code* __400__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai

## 3. Menghapus Komentar pada Thread

API harus dapat menghapus __komentar__ pada *thread* melalui *route*:
- Method: __DELETE__
- Path: __/threads/{threadId}/comments/{commentId}__

Response yang harus dikembalikan:
- Status Code: __200__
- Response Body:
    ```json
    {
        "status": "success",
    }
    ```

__Ketentuan:__
- Menghapus komentar pada thread merupakan resource yang dibatasi (*restrict*). Untuk mengaksesnya membutuhkan access token guna mengetahui siapa yang menghapus komentar.
- __Hanya pemilik komentar yang dapat menghapus komentar__. Jika bukan pemilik komentar, maka:
    - Kembalikan dengan *status code* __403__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai
- Jika *thread* atau komentar yang hendak dihapus tidak ada atau tidak valid, maka:
    - Kembalikan dengan *status code* __404__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai
- Komentar dihapus secara __soft delete__, alias tidak benar-benar dihapus dari database. Anda bisa membuat dan memanfaatkan kolom seperti `is_delete` sebagai indikator apakah komentar dihapus atau tidak.

## 4. Mendapatkan Detail Thread

API harus dapat __mendapatkan__ detail *thread* melalui *route*:
- Method: __GET__
- Path: __/threads/{threadId}__

Response yang harus dikembalikan:
- Status Code: __200__
- Response Body:
    ```json
    {
        "status": "success",
        "data": {
            "thread": {
                "id": "thread-h_2FkLZhtgBKY2kh4CC02",
                "title": "sebuah thread",
                "body": "sebuah body thread",
                "date": "2021-08-08T07:19:09.775Z",
                "username": "dicoding",
                "comments": [
                    {
                        "id": "comment-_pby2_tmXV6bcvcdev8xk",
                        "username": "johndoe",
                        "date": "2021-08-08T07:22:33.555Z",
                        "content": "sebuah comment"
                    },
                    {
                        "id": "comment-yksuCoxM2s4MMrZJO-qVD",
                        "username": "dicoding",
                        "date": "2021-08-08T07:26:21.338Z",
                        "content": "**komentar telah dihapus**"
                    }
                ]
            }
        }
    }
    ```

__Ketentuan:__
- Mendapatkan detail thread merupakan resource terbuka. Sehingga tidak perlu melampirkan access token.
- Jika *thread* yang diakses tidak ada atau tidak valid, maka:
    - Kembalikan dengan *status code* __404__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai
- Wajib menampilkan seluruh *komentar* yang terdapat pada *thread* tersebut sesuai dengan contoh di atas.
- Komentar yang dihapus ditampilkan dengan konten __\*\*komentar telah dihapus\*\*__.
- Komentar diurutkan secara *ascending* (dari kecil ke besar) berdasarkan waktu berkomentar.

## 5. Menerapkan Automation Testing

Proyek Forum API wajib menerapkan automation testing dengan kriteria berikut:

- __Unit Testing__:

    Wajib menerapkan Unit Testing pada bisnis logika yang ada. Baik di *Entities* ataupun di *Use Case*.
- __Integration Test__:

    Wajib menerapkan Integration Test dalam menguji interaksi __database__ dengan *Repository*.


## 6. Menerapkan Clean Architecture

Proyek Forum API wajib menerapkan __Clean Architecture__. Di mana *source code* terdiri dari 4 layer yaitu:
- __Entities__ (jika dibutuhkan)

    Tempat penyimpanan data entitas bisnis utama. Jika suatu bisnis butuh mengelola struktur data yang kompleks, maka buatlah entities.
- __Use Case__

    Di gunakan sebagai tempat menuliskannya flow atau alur bisnis logika.
- __Interface Adapter__ (Repository dan Handler)

    Mediator atau penghubung antara layer framework dengan layer use case.
- __Frameworks__ (Database dan HTTP server)

    Level paling luar merupakan bagian yang berhubungan dengan framework.