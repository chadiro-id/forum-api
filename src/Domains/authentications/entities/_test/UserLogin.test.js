const UserLogin = require('../UserLogin');

describe('UserLogin Entity', () => {
  const dummyPayload = {
    username: 'johndoe',
    password: 'secret',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingUsername = { ...dummyPayload };
      delete missingUsername.username;
      const missingPassword = { ...dummyPayload };
      delete missingPassword.password;

      const emptyUsername = { ...dummyPayload, username: '' };
      const emptyPassword = { ...dummyPayload, password: '' };

      expect(() => new UserLogin(missingUsername))
        .toThrow('USER_LOGIN.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserLogin(missingPassword))
        .toThrow('USER_LOGIN.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserLogin(emptyUsername))
        .toThrow('USER_LOGIN.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new UserLogin(emptyPassword))
        .toThrow('USER_LOGIN.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const usernameNotString = { ...dummyPayload, username: 123 };
      const passwordNotString = { ...dummyPayload, password: ['secret'] };

      expect(() => new UserLogin(usernameNotString))
        .toThrow('USER_LOGIN.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new UserLogin(passwordNotString))
        .toThrow('USER_LOGIN.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const userLogin = new UserLogin(payload);

      expect(userLogin.username).toEqual(payload.username);
      expect(userLogin.password).toEqual(payload.password);
    });
  });
});