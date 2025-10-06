const AuthenticateUserEntity = require('../AuthenticateUserEntity');

describe('AuthenticateUserEntity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      username: 'forumapi',
    };

    expect(() => new AuthenticateUserEntity(payload)).toThrow('AUTHENTICATE_USER_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      username: 'forumapi',
      password: 12345,
    };

    expect(() => new AuthenticateUserEntity(payload)).toThrow('AUTHENTICATE_USER_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});