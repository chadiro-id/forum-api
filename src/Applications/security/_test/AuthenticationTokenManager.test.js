const AuthenticationTokenManager = require('../AuthenticationTokenManager');

describe('AuthenticationTokenManager', () => {
  describe('when abstract method invoked', () => {
    it('should throw error with properly message', async () => {
      const tokenManager = new AuthenticationTokenManager();

      await expect(tokenManager.createAccessToken(''))
        .rejects.toThrow('AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
      await expect(tokenManager.createRefreshToken(''))
        .rejects.toThrow('AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
      await expect(tokenManager.verifyRefreshToken(''))
        .rejects.toThrow('AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
      await expect(tokenManager.decodePayload(''))
        .rejects.toThrow('AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
    });
  });
});
