const DomainErrorTranslator = require('../DomainErrorTranslator');
const InvariantError = require('../InvariantError');
const AuthenticationError = require('../AuthenticationError');
const NotFoundError = require('../NotFoundError');
const AuthorizationError = require('../AuthorizationError');

describe('DomainErrorTranslator', () => {
  it('should return original error when error is not needed to translate', () => {
    const error = new Error('some error message');

    const translatedError = DomainErrorTranslator.translate(error);
    expect(translatedError).toStrictEqual(error);
  });

  const testTranslator = (errorArray) => {
    test.each(errorArray)('should translate "$errorMessage" to $expectedError', ({
      errorMessage, expectedError
    }) => {
      expect(DomainErrorTranslator.translate(new Error(errorMessage)))
        .toStrictEqual(expectedError);
    });
  };

  describe('Users Use Case', () => {
    const errorArray = [
      {
        errorMessage: 'ADD_USER_USE_CASE.USERNAME_NOT_AVAILABLE',
        expectedError: new InvariantError('username tidak tersedia'),
      },
    ];

    testTranslator(errorArray);
  });

  describe('Authentications Use Case', () => {
    const errorArray = [
      {
        errorMessage: 'ADD_AUTHENTICATION_USE_CASE.USER_NOT_FOUND',
        expectedError: new InvariantError('pengguna tidak ditemukan'),
      },
      {
        errorMessage: 'ADD_AUTHENTICATION_USE_CASE.PASSWORD_NOT_MATCH',
        expectedError: new AuthenticationError('kredensial yang Anda masukkan salah'),
      },
      {
        errorMessage: 'PUT_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND',
        expectedError: new InvariantError('refresh token tidak ditemukan di database'),
      },
      {
        errorMessage: 'PUT_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_VALID',
        expectedError: new InvariantError('refresh token tidak valid'),
      },
      {
        errorMessage: 'DELETE_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND',
        expectedError: new InvariantError('refresh token tidak ditemukan di database'),
      }
    ];

    testTranslator(errorArray);
  });

  describe('Comments Use Case', () => {
    const errorArray = [
      {
        errorMessage: 'ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND',
        expectedError: new NotFoundError('Thread tidak ditemukan'),
      },
      {
        errorMessage: 'DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND',
        expectedError: new NotFoundError('Komentar tidak ditemukan'),
      },
      {
        errorMessage: 'DELETE_COMMENT_USE_CASE.OWNER_NOT_MATCH',
        expectedError: new AuthorizationError('Pengguna tidak memiliki hak akses'),
      }
    ];

    testTranslator(errorArray);
  });

  describe('Replies Use Case', () => {
    const errorArray = [
      {
        errorMessage: 'ADD_REPLY_USE_CASE.COMMENT_NOT_FOUND',
        expectedError: new NotFoundError('Komentar tidak ditemukan'),
      },
      {
        errorMessage: 'DELETE_REPLY_USE_CASE.REPLY_NOT_FOUND',
        expectedError: new NotFoundError('Balasan tidak ditemukan'),
      },
      {
        errorMessage: 'DELETE_REPLY_USE_CASE.OWNER_NOT_MATCH',
        expectedError: new AuthorizationError('Pengguna tidak memiliki hak akses'),
      }
    ];

    testTranslator(errorArray);
  });
});