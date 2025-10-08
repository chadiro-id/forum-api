const AuthenticationRepository = require('../AuthenticationRepository');

describe('AuthenticationRepository', () => {
  describe('when abstract method invoked', () => {
    it('should throw error with properly message', async () => {
      const authenticationRepository = new AuthenticationRepository();

      await expect(authenticationRepository.addToken(''))
        .rejects.toThrow('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
      await expect(authenticationRepository.checkAvailabilityToken(''))
        .rejects.toThrow('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
      await expect(authenticationRepository.deleteToken(''))
        .rejects.toThrow('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
  });
});
