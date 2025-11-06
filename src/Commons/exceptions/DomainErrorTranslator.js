const InvariantError = require('./InvariantError');
const AuthenticationError = require('./AuthenticationError');
const NotFoundError = require('./NotFoundError');
const AuthorizationError = require('./AuthorizationError');

const usersUseCaseError = {
  'ADD_USER_USE_CASE.USERNAME_NOT_AVAILABLE': new InvariantError('username tidak tersedia'),
};
const authenticationsUseCaseError = {
  'ADD_AUTHENTICATION_USE_CASE.USER_NOT_EXIST': new InvariantError('user tidak ada, username tidak ditemukan'),
  'ADD_AUTHENTICATION_USE_CASE.PASSWORD_NOT_MATCH': new AuthenticationError('kredensial yang Anda masukkan salah'),
  'PUT_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND': new InvariantError('refresh token tidak ditemukan di database'),
  'PUT_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_VALID': new InvariantError('refresh token tidak valid'),
  'DELETE_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND': new InvariantError('refresh token tidak ditemukan di database'),
};
const threadsUseCaseError = {};
const commentsUseCaseError = {
  'ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND': new NotFoundError('Thread tidak ditemukan'),
  'DELETE_COMMENT_USE_CASE.COMMENT_NOT_EXIST': new NotFoundError('Komentar tidak ditemukan'),
  'DELETE_COMMENT_USE_CASE.OWNER_NOT_MATCH': new AuthorizationError('Pengguna tidak memiliki hak akses'),
};
const repliesUseCaseError = {
  'ADD_REPLY_USE_CASE.THREAD_NOT_FOUND': new NotFoundError('Thread tidak ditemukan'),
  'DELETE_REPLY_USE_CASE.THREAD_NOT_FOUND': new NotFoundError('Thread tidak ada, id tidak ditemukan'),
};

const directories = Object.assign(
  {},
  usersUseCaseError,
  authenticationsUseCaseError,
  threadsUseCaseError,
  commentsUseCaseError,
  repliesUseCaseError
);

class DomainErrorTranslator {
  static translate(error) {
    return directories[error.message] || error;
  }
}

module.exports = DomainErrorTranslator;