const DomainErrorTranslator = require('../DomainErrorTranslator');
const InvariantError = require('../InvariantError');

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER_ENTITY.USERNAME_EXCEED_CHAR_LIMIT')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER_ENTITY.USERNAME_CONTAIN_RESTRICTED_CHARACTER')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'));
    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('harus mengirimkan username dan password'));
    expect(DomainErrorTranslator.translate(new Error('USER_LOGIN_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('username dan password harus string'));
    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('harus mengirimkan username dan password'));
    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('username dan password harus string'));
    expect(DomainErrorTranslator.translate(new Error('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN')))
      .toStrictEqual(new InvariantError('harus mengirimkan token refresh'));
    expect(DomainErrorTranslator.translate(new Error('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('refresh token harus string'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN')))
      .toStrictEqual(new InvariantError('harus mengirimkan token refresh'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('refresh token harus string'));
  });

  it('should return original error when error message is not needed to translate', () => {
    const error = new Error('some_error_message');

    const translatedError = DomainErrorTranslator.translate(error);

    expect(translatedError).toStrictEqual(error);
  });
});