const AuthenticationTokenManager = require('../AuthenticationTokenManager');

describe('AuthenticationTokenManager', () => {
  const authTokenManager = new AuthenticationTokenManager();
  const methods = [
    authTokenManager.createAccessToken,
    authTokenManager.createRefreshToken,
    authTokenManager.verifyRefreshToken,
    authTokenManager.decodePayload,
  ];

  test.each(methods)('should throw error when abstract behavior invoked %p', async (fn) => {
    await expect(fn())
      .rejects.toThrow('AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED');
  });
});
