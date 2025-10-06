const RegisterUserEntity = require('../RegisterUserEntity');

describe('a RegisterUserEntity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      username: 'abc',
      password: 'abc',
    };

    expect(() => new RegisterUserEntity(payload)).toThrow('REGISTER_USER_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      username: 123,
      fullname: true,
      password: 'abc',
    };

    expect(() => new RegisterUserEntity(payload)).toThrow('REGISTER_USER_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when username contains more than 50 character', () => {
    const payload = {
      username: 'forumapiforumapiforumapiforumapiforumapiforumapiforumapiforumapi',
      fullname: 'Forum API',
      password: 'abc',
    };

    expect(() => new RegisterUserEntity(payload)).toThrow('REGISTER_USER_ENTITY.USERNAME_EXCEED_CHAR_LIMIT');
  });

  it('should throw error when username contains restricted character', () => {
    const payload = {
      username: 'forum api',
      fullname: 'Forum Api',
      password: 'abc',
    };

    expect(() => new RegisterUserEntity(payload)).toThrow('REGISTER_USER_ENTITY.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
  });

  it('should create entity correctly', () => {
    const payload = {
      username: 'forumapi',
      fullname: 'Forum Api',
      password: 'abc',
    };

    const { username, fullname, password } = new RegisterUserEntity(payload);

    expect(username).toEqual(payload.username);
    expect(fullname).toEqual(payload.fullname);
    expect(password).toEqual(payload.password);
  });
});
