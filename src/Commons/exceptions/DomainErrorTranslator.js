const InvariantError = require('./InvariantError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru, data tidak lengkap'),
  'REGISTER_USER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru, tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_EXCEED_CHAR_LIMIT': new InvariantError('tidak dapat membuat user baru, username maksimal 50 karakter'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan judul dan isi thread'),
  'NEW_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('judul dan isi thread harus string'),
  'ADD_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan isi komentar'),
  'ADD_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('komentar harus string'),
  'ADD_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('balasan tidak valid'),
  'ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('balasan tidak valid'),
  'PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
};

module.exports = DomainErrorTranslator;