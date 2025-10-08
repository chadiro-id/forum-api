const RegisteredUserEntity = require('../RegisteredUserEntity');

describe('a RegisteredUserEntity', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      username: 'forumapi',
      fullname: 'Forum Api',
    };

    expect(() => new RegisteredUserEntity(payload)).toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      username: 'forumapi',
      fullname: {},
    };

    expect(() => new RegisteredUserEntity(payload)).toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create entity correctly', () => {
    const payload = {
      id: 'user-123',
      username: 'forumapi',
      fullname: 'Forum Api',
    };

    const registeredUser = new RegisteredUserEntity(payload);

    expect(registeredUser.id).toEqual(payload.id);
    expect(registeredUser.username).toEqual(payload.username);
    expect(registeredUser.fullname).toEqual(payload.fullname);
  });
});
