const Jwt = require('@hapi/jwt');
const JwtTokenManager = require('../JwtTokenManager');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');

describe('JwtTokenManager', () => {
  it('must be an instance of AuthenticationTokenManager', () => {
    const jwtTokenManager = new JwtTokenManager({});
    expect(jwtTokenManager).toBeInstanceOf(AuthenticationTokenManager);
  });

  describe('createAccessToken', () => {
    it('should call the jwt generate method with correct payload and access token key', async () => {
      const payload = { username: 'johndoe' };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };

      const jwtTokenManager = new JwtTokenManager(mockJwtToken, 'access_token_key', 'refresh_token_key');

      const accessToken = await jwtTokenManager.createAccessToken(payload);

      expect(mockJwtToken.generate).toHaveBeenCalledWith(payload, 'access_token_key');
      expect(accessToken).toEqual('mock_token');
    });
  });

  describe('createRefreshToken', () => {
    it('should call the jwt generate method with correct payload and refresh token key', async () => {
      const payload = { username: 'johndoe' };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };

      const jwtTokenManager = new JwtTokenManager(mockJwtToken, 'access_token_key', 'refresh_token_key');

      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      expect(mockJwtToken.generate).toHaveBeenCalledWith(payload, 'refresh_token_key');
      expect(refreshToken).toEqual('mock_token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token correctly', async () => {
      const spyVerify = jest.spyOn(Jwt.token, 'verify');
      const jwtTokenManager = new JwtTokenManager(Jwt.token, 'access_token_key', 'refresh_token_key');
      const refreshToken = await jwtTokenManager.createRefreshToken({ username: 'johndoe' });
      const artifacts = Jwt.token.decode(refreshToken);

      const result = await jwtTokenManager.verifyRefreshToken(refreshToken);
      expect(result).toStrictEqual({ isValid: true });

      expect(spyVerify).toHaveBeenCalledTimes(1);
      expect(spyVerify).toHaveBeenCalledWith(artifacts, 'refresh_token_key');
    });

    it('should verify invalid refresh token correctly', async () => {
      const jwtTokenManager = new JwtTokenManager(Jwt.token, 'access_token_key', 'refresh_token_key');
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'johndoe' });

      const result = await jwtTokenManager.verifyRefreshToken(accessToken);
      expect(result).toEqual({
        isValid: false,
        message: expect.any(String),
      });
    });
  });

  describe('decodePayload', () => {
    it('should correctly decode the payload from token', async () => {
      const jwtTokenManager = new JwtTokenManager(Jwt.token, 'access_token_key', 'refresh_token_key');
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'johndoe' });

      const { username: expectedUsername } = await jwtTokenManager.decodePayload(accessToken);

      expect(expectedUsername).toEqual('johndoe');
    });
  });
});
