const UserLoginEntity = require('../UserLoginEntity');

describe('AuthenticateUserEntity', () => {
  it('should throw error when payload does not contain needed property', () => {
    const payload = {
      username: 'forumapi',
    };

    expect(() => new UserLoginEntity(payload))
      .toThrow('USER_LOGIN_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      username: 'forumapi',
      password: 12345,
    };

    expect(() => new UserLoginEntity(payload))
      .toThrow('USER_LOGIN_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create authentication entity correctly', () => {
    const payload = {
      username: 'forumapi',
      password: '12345',
    };

    const entity = new UserLoginEntity(payload);

    expect(entity).toBeInstanceOf(UserLoginEntity);
    expect(entity.username).toEqual(payload.username);
    expect(entity.password).toEqual(payload.password);
  });
});