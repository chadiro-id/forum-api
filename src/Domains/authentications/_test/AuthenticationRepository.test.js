const AuthenticationRepository = require('../AuthenticationRepository');

describe('AuthenticationRepository', () => {
  const authenticationRepository = new AuthenticationRepository();
  const methods = [
    authenticationRepository.addToken,
    authenticationRepository.deleteToken,
    authenticationRepository.isTokenExist,
  ];

  test.each(methods)('should throw error when abstract behavior invoked %p', async (fn) => {
    await expect(fn())
      .rejects.toThrow('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
