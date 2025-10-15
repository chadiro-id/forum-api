const UserAuthenticationEntity = require('../UserAuthentication');

describe('UserAuthenticationEntity', () => {
  const exampleValidPayload = {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
  };

  describe('when the given payload is not valid', () => {
    it('should throw error if payload not contain needed property', () => {
      const missingAccessToken = { ...exampleValidPayload };
      delete missingAccessToken.accessToken;

      const missingRefreshToken = { ...exampleValidPayload };
      delete missingRefreshToken.refreshToken;

      const emptyAccessToken = {
        ...exampleValidPayload,
        accessToken: '',
      };
      const emptyRefreshToken = {
        ...exampleValidPayload,
        refreshToken: '',
      };

      expect(() => new UserAuthenticationEntity(missingAccessToken))
        .toThrow('USER_AUTHENTICATION_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserAuthenticationEntity(missingRefreshToken))
        .toThrow('USER_AUTHENTICATION_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserAuthenticationEntity(emptyAccessToken))
        .toThrow('USER_AUTHENTICATION_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserAuthenticationEntity(emptyRefreshToken))
        .toThrow('USER_AUTHENTICATION_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if payload does not meet data type specification', () => {
      const accessTokenNotString = {
        ...exampleValidPayload,
        accessToken: 123,
      };
      const refreshTokenNotString = {
        ...exampleValidPayload,
        refreshToken: true,
      };

      expect(() => new UserAuthenticationEntity(accessTokenNotString))
        .toThrow('USER_AUTHENTICATION_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new UserAuthenticationEntity(refreshTokenNotString))
        .toThrow('USER_AUTHENTICATION_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('when the given payload is valid', () => {
    it('should create entity correctly', () => {
      const payload = { ...exampleValidPayload };

      const { accessToken, refreshToken } = new UserAuthenticationEntity(payload);

      expect(accessToken).toEqual(payload.accessToken);
      expect(refreshToken).toEqual(payload.refreshToken);
    });

    it('should create entity correctly and not contain extra properties', () => {
      const extraPayload = {
        ...exampleValidPayload,
        extra: 'extra property',
      };

      const userAuthentication = new UserAuthenticationEntity(extraPayload);

      expect(userAuthentication).toEqual(new UserAuthenticationEntity({
        accessToken: extraPayload.accessToken,
        refreshToken: extraPayload.refreshToken,
      }));
      expect(userAuthentication.extra).toBeUndefined();
    });
  });
});
