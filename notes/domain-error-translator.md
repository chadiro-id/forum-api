# Domain Error Translator

## Skenario

Potongan Kode:
1. `ThreadHandler.js`
    ```js
    // postThreadHandler
    const addThreadUseCase = this._container.getInstance(
        AddThreadUseCase.name
    )
    const { id: credentialId } = request.auth.credentials
    const addedThread = await addThreadUseCase.execute(
        request.payload,
        credentialId // Misal ini typo `credentialsId`
    )
    ```
2. `AddThreadUseCase.js`
    ```js
    async execute(useCasePayload, owner) {
      useCasePayload.owner = owner // owner disini undefine
      const addThread = new AddThread(useCasePayload)
      return this._threadRepository.addThread(addThread)
    }
    ```
3. `AddThreadEntity.js`
    ```js
    // disini owner di validasi 1 grup dengan payload dari klien, 
    // Semisal input klien yaitu title dan body valid, owner tidak valid, maka akan melempar error,
    if (!title || !body || !owner) {
			throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
		}
    ```
4. `DomainErrorTranslator.js`
    ```js
    // disini error dari entity (owner undefined) ditranslate ke klien error 400 bad request
    // Nah, si klien akan bingung, dia merasa sudah memasukan title dan body secara benar, kenapa error bad request,
    // dan mungkin bagi kita sebagai programmernya tidak akan merasa salah, bagi kita yang salah adalah klien
    // kira-kira seperti itu mas,
    {
      'ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(
		    'harus mengirimkan payload dengan properti yang lengkap'
      ),
    }
    ```

Nah, itu memang skenario yang mungkin tidak akan terjadi kalau source code hanya kita sendiri yang pegang,
namun bagaimana jika suatu saat direfactor orang lain, atau apalah gitu, pada poin nya yang ingin saya sampaikan itu, bukan DET yang salah, cuma ini rawan kalo kita gak bener2 memahami alur nya. 

## Penggunaan yang pas menurut saya

Sebenernya saya bukan anti dengan DET ini, cuma kebetulan DET dalam forum API ini hanya dipakai untuk translate 400 Bad Request,
Sedang error lain seperti AuthenticationError, dll, di panggil langsung di repository maupun yang lain seperti password hash saat compare password,
Kode 1 sesuai starter project:
```js
// PasswordHash
async comparePassword(password, hashedPassword) {
  const result = await this._bcrypt.compare(password, hashedPassword);

  if (!result) {
    throw new AuthenticationError('kredensial yang Anda masukkan salah');
  }
}

// Use Case

await this._passwordHash.comparePassword(password, encryptedPassword);
```
Kode 2:
```js
// PasswordHash
async comparePassword(password, hashedPassword) {
  return this._bcrypt.compare(password, hashedPassword);
}

// Use Case
const isPasswordMatch = await this._passwordHash.comparePassword(password, encryptedPassword);

if (!isPasswordMatch) {
  // disini use case tidak bisa langsung menggunakan AuthenticationError
  // Maka bisa di translate dengan DomainErrorTranslator
  throw new Error('USE_CASE.INVALID_CREDENTIAL');
}
```

## Kesimpulan
Maaf mas, saya tidak pandai menjelaskan.