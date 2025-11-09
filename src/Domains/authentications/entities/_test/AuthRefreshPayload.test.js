const AuthRefreshPayload = require('../AuthRefreshPayload');

describe('AuthRefreshPayload Entity', () => {
  it('should correctly create the entity', () => {
    const payload = { refreshToken: 'refresh_token' };

    const { refreshToken } = new AuthRefreshPayload(payload);
    expect(refreshToken).toStrictEqual(payload.refreshToken);
  });
});