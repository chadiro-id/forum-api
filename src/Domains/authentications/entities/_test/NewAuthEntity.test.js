const NewAuthEntity = require('../NewAuthEntity');

describe('NewAuthEntity', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      accessToken: 'accessToken',
    };

    expect(() => new NewAuthEntity(payload)).toThrow('NEW_AUTH_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      accessToken: 'accessToken',
      refreshToken: 1234,
    };

    expect(() => new NewAuthEntity(payload)).toThrow('NEW_AUTH_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
