const AuthRefreshPayload = require('../AuthRefreshPayload');

describe('AuthRefreshPayload Entity', () => {
  it('should correctly create the entity', () => {
    const payload = { refreshToken: 'refresh_token' };

    const { refreshToken } = new AuthRefreshPayload(payload);
    expect(refreshToken).toStrictEqual(payload.refreshToken);
  });

  it('should throw error when payload not contain needed property', () => {
    const missingRefreshToken = {};
    const emptyRefreshToken = { refreshToken: '' };

    expect(() => new AuthRefreshPayload(missingRefreshToken))
      .toThrow('AUTH_REFRESH_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new AuthRefreshPayload(emptyRefreshToken))
      .toThrow('AUTH_REFRESH_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property does not meet data type specification', () => {
    const refreshTokenNotString = { refreshToken: 123 };

    expect(() => new AuthRefreshPayload(refreshTokenNotString))
      .toThrow('AUTH_REFRESH_PAYLOAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});