const UserAuthentication = require('../UserAuthentication');

describe('UserAuthentication Entity', () => {
  const dummyPayload = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingAccessToken = { ...dummyPayload };
      delete missingAccessToken.accessToken;
      const missingRefreshToken = { ...dummyPayload };
      delete missingRefreshToken.refreshToken;

      const emptyAccessToken = { ...dummyPayload, accessToken: '' };
      const emptyRefreshToken = { ...dummyPayload, refreshToken: '' };

      expect(() => new UserAuthentication(missingAccessToken))
        .toThrow('USER_AUTHENTICATION.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserAuthentication(missingRefreshToken))
        .toThrow('USER_AUTHENTICATION.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserAuthentication(emptyAccessToken))
        .toThrow('USER_AUTHENTICATION.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserAuthentication(emptyRefreshToken))
        .toThrow('USER_AUTHENTICATION.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const accessTokenNotString = { ...dummyPayload, accessToken: 123 };
      const refreshTokenNotString = { ...dummyPayload, refreshToken: true };

      expect(() => new UserAuthentication(accessTokenNotString))
        .toThrow('USER_AUTHENTICATION.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new UserAuthentication(refreshTokenNotString))
        .toThrow('USER_AUTHENTICATION.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when refresh token is equal to access token', () => {
      const payload = { ...dummyPayload };
      payload.refreshToken = dummyPayload.accessToken;

      expect(() => new UserAuthentication(payload))
        .toThrow('USER_AUTHENTICATION.REFRESH_TOKEN_EQUAL_TO_ACCESS_TOKEN');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { accessToken, refreshToken } = new UserAuthentication(payload);

      expect(accessToken).toEqual(payload.accessToken);
      expect(refreshToken).toEqual(payload.refreshToken);
    });

    it('should correctly create the entity and not contain extra properties', () => {
      const extraPayload = { ...dummyPayload, extra: 'extra property' };

      const userAuthentication = new UserAuthentication(extraPayload);

      expect(userAuthentication.accessToken).toEqual(extraPayload.accessToken);
      expect(userAuthentication.refreshToken).toEqual(extraPayload.refreshToken);
      expect(userAuthentication.extra).toBeUndefined();
    });
  });
});
