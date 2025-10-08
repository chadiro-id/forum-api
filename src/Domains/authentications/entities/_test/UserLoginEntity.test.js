const UserLoginEntity = require('../UserLoginEntity');

describe('UserLoginEntity', () => {
  const exampleValidPayload = {
    username: 'forumapi',
    password: 'secret',
  };

  describe('when the given payload is not valid', () => {
    it('should throw error if payload not contain needed property', () => {
      const missingUsername = { ...exampleValidPayload };
      delete missingUsername.username;

      const missingPassword = { ...exampleValidPayload };
      delete missingPassword.password;

      const emptyUsername = {
        ...exampleValidPayload,
        username: '',
      };

      const emptyPassword = {
        ...exampleValidPayload,
        password: '',
      };

      expect(() => new UserLoginEntity(missingUsername))
        .toThrow('USER_LOGIN_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserLoginEntity(missingPassword))
        .toThrow('USER_LOGIN_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserLoginEntity(emptyUsername))
        .toThrow('USER_LOGIN_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserLoginEntity(emptyPassword))
        .toThrow('USER_LOGIN_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if payload does not meet data type specification', () => {
      const usernameNotString = {
        ...exampleValidPayload,
        username: 123,
      };
      const passwordNotString = {
        ...exampleValidPayload,
        password: ['secret'],
      };

      expect(() => new UserLoginEntity(usernameNotString))
        .toThrow('USER_LOGIN_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new UserLoginEntity(passwordNotString))
        .toThrow('USER_LOGIN_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('when the given payload is valid', () => {
    it('should create entity correctly', () => {
      const payload = { ...exampleValidPayload };

      const userLogin = new UserLoginEntity(payload);

      expect(userLogin.username).toEqual(payload.username);
      expect(userLogin.password).toEqual(payload.password);
    });
  });
});