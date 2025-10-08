const Jwt = require('@hapi/jwt');
const config = require('../../../Commons/config');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const JwtTokenManager = require('../JwtTokenManager');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');

describe('JwtTokenManager', () => {
  it('must be an instance of AuthenticationTokenManager', () => {
    const jwtTokenManager = new JwtTokenManager({});

    expect(jwtTokenManager).toBeInstanceOf(AuthenticationTokenManager);
  });

  describe('#createAccessToken', () => {
    it('must call the jwt generate method with correct payload and access token key', async () => {
      const payload = { username: 'forumapi' };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };

      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      const accessToken = await jwtTokenManager.createAccessToken(payload);

      expect(mockJwtToken.generate).toHaveBeenCalledWith(payload, config.tokenize.accessTokenKey);
      expect(accessToken).toEqual('mock_token');
    });
  });

  describe('#createRefreshToken', () => {
    it('must call the jwt generate method with correct payload and refresh token key', async () => {
      const payload = { username: 'forumapi' };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      expect(mockJwtToken.generate).toHaveBeenCalledWith(payload, config.tokenize.refreshTokenKey);
      expect(refreshToken).toEqual('mock_token');
    });
  });

  describe('#verifyRefreshToken', () => {
    it('must throw InvariantError when verification fails', async () => {
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'forumapi' });

      await expect(jwtTokenManager.verifyRefreshToken(accessToken))
        .rejects
        .toThrow(InvariantError);
    });

    it('should not throw error when a valid refresh token provided', async () => {
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const refreshToken = await jwtTokenManager.createRefreshToken({ username: 'forumapi' });

      await expect(jwtTokenManager.verifyRefreshToken(refreshToken))
        .resolves
        .not.toThrow();
    });
  });

  describe('#decodePayload', () => {
    it('must correctly decode the payload from token', async () => {
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'forumapi' });

      const { username: expectedUsername } = await jwtTokenManager.decodePayload(accessToken);

      expect(expectedUsername).toEqual('forumapi');
    });
  });
});
