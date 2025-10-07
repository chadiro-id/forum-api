const UserAuthenticationEntity = require('../UserAuthenticationEntity');

describe('NewAuthEntity', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      accessToken: 'accessToken',
    };

    expect(() => new UserAuthenticationEntity(payload)).toThrow('NEW_AUTH_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      accessToken: 'accessToken',
      refreshToken: 1234,
    };

    expect(() => new UserAuthenticationEntity(payload)).toThrow('NEW_AUTH_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewAuthEntity correctly', () => {
    const payload = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    const entity = new UserAuthenticationEntity(payload);

    expect(entity).toBeInstanceOf(UserAuthenticationEntity);
    expect(entity.accessToken).toEqual(payload.accessToken);
    expect(entity.refreshToken).toEqual(payload.refreshToken);
  });
});
