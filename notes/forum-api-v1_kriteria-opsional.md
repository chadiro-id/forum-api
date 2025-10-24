# Kriteria Opsional Forum API

## Menambahkan Balasan pada Komentar Thread

API harus dapat menambahkan balasan pada komentar thread melalui route:
- Method: __POST__
- Path: __/threads/{threadId}/comments/{commentId}/replies__
- Body Request:
    ```json
    {
        "content": "string"
    }
    ```

Response yang harus dikembalikan:
- Status Code: __201__
- Response Body:
    ```json
    {
        "status": "success",
        "data": {
            "addedReply": {
                "id": "reply-BErOXUSefjwWGW1Z10Ihk",
                "content": "sebuah balasan",
                "owner": "user-CrkY5iAgOdMqv36bIvys2"
            }
        }
    }
    ```

__Ketentuan:__
- Menambahkan __balasan__ pada *komentar thread* merupakan resource yang dibatasi (*restrict*). Untuk mengaksesnya membutuhkan *access token* guna mengetahui siapa yang membuat balasan komentar.
- Jika *thread* atau *komentar* yang diberi balasan tidak ada atau tidak valid, maka:
    - Kembalikan dengan *status code* __404__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai
- Jika properti *body request* tidak lengkap atau tidak sesuai, maka:
    - Kembalikan dengan *status code* __400__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai
- Balasan pada komentar thread harus ditampilkan pada setiap item __comments__ ketika mengakses *detail thread*. Contohnya seperti ini:
    ```json
    {
        "status": "success",
        "data": {
            "thread": {
                "id": "thread-AqVg2b9JyQXR6wSQ2TmH4",
                "title": "sebuah thread",
                "body": "sebuah body thread",
                "date": "2021-08-08T07:59:16.198Z",
                "username": "dicoding",
                "comments": [
                    {
                        "id": "comment-q_0uToswNf6i24RDYZJI3",
                        "username": "dicoding",
                        "date": "2021-08-08T07:59:18.982Z",
                        "replies": [
                            {
                                "id": "reply-BErOXUSefjwWGW1Z10Ihk",
                                "content": "**balasan telah dihapus**",
                                "date": "2021-08-08T07:59:48.766Z",
                                "username": "johndoe"
                            },
                            {
                                "id": "reply-xNBtm9HPR-492AeiimpfN",
                                "content": "sebuah balasan",
                                "date": "2021-08-08T08:07:01.522Z",
                                "username": "dicoding"
                            }
                        ],
                        "content": "sebuah comment"
                    }
                ]
            }
        }
    }
    ```
- Balasan yang dihapus ditampilkan dengan konten __\*\*balasan telah dihapus\*\*__.
- Balasan diurutkan secara *ascending* (dari kecil ke besar) berdasarkan waktu berkomentar.

## Menghapus Balasan pada Komentar Thread

API harus dapat menghapus balasan pada komentar thread melalui *route*:
- Metod: __DELETE__
- Path: __/threads/{threadId}/comments/{commentId}/replies/{replyId}__

Response yang harus dikembalikan:
- Status Code: __200__
- Response Body:
    ```json
    {
        "status": "success"
    }
    ```

__Ketentuan:__
- Menghapus balasan pada *komentar thread* merupakan resource yang dibatasi (*restrict*). Untuk mengaksesnya membutuhkan *access token* guna mengetahui siapa yang menghapus balasan.
- __Hanya pemilik balasan yang dapat menghapus balasan__. Bila bukan pemilik balasan, maka:
    - Kembalikan dengan *status code* __403__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai
- Jika thread, komentar, atau balasan yang hendak dihapus tidak ada atau tidak valid, maka:
    - Kembalikan dengan *status code* __404__
    - Berikan *body response*:
        - __status__: "fail"
        - __message__: Pesan yang sesuai
- Balasan dihapus secara __soft delete__, alias tidak benar-benar dihapus dari database. Anda bisa membuat dan memanfaatkan *kolom* seperti `is_delete` sebagai indikator apakah komentar dihapus atau tidak.