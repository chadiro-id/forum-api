const InvariantError = require('./InvariantError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER_ENTITY.USERNAME_EXCEED_CHAR_LIMIT': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER_ENTITY.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'NEW_THREAD_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan judul dan isi thread'),
  'NEW_THREAD_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('judul dan isi thread harus string'),
  'PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
};

module.exports = DomainErrorTranslator;