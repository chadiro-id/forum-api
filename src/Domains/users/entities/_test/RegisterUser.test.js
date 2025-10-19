const RegisterUser = require('../RegisterUser');

describe('RegisterUser Entity', () => {
  const dummyPayload = {
    username: 'johndoe',
    password: 'secret',
    fullname: 'John Doe',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingUsername = { ...dummyPayload };
      delete missingUsername.username;
      const missingPassword = { ...dummyPayload };
      delete missingPassword.password;
      const missingFullname = { ...dummyPayload };
      delete missingFullname.fullname;

      const emptyUsername = { ...dummyPayload, username: '' };
      const emptyPassword = { ...dummyPayload, password: '' };
      const emptyFullname = { ...dummyPayload, fullname: '' };

      expect(() => new RegisterUser(missingUsername))
        .toThrow('REGISTER_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUser(missingPassword))
        .toThrow('REGISTER_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUser(missingFullname))
        .toThrow('REGISTER_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUser(emptyUsername))
        .toThrow('REGISTER_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUser(emptyPassword))
        .toThrow('REGISTER_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUser(emptyFullname))
        .toThrow('REGISTER_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
      const usernameNotString = { ...dummyPayload, username: 123 };
      const passwordNotString = { ...dummyPayload, password: true };
      const fullnameNotString = { ...dummyPayload, fullname: ['Forum Api'] };

      expect(() => new RegisterUser(usernameNotString))
        .toThrow('REGISTER_USER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new RegisterUser(passwordNotString))
        .toThrow('REGISTER_USER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new RegisterUser(fullnameNotString))
        .toThrow('REGISTER_USER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when username contains more than 50 character', () => {
      const payload = {
        ...dummyPayload,
        username: 'forumapiforumapiforumapiforumapiforumapiforumapifor',
      };

      expect(() => new RegisterUser(payload))
        .toThrow('REGISTER_USER.USERNAME_EXCEED_CHAR_LIMIT');
    });

    it('should throw error when username contains restricted character', () => {
      const usernameContainWhiteSpace = { ...dummyPayload, username: 'forum api' };
      const usernameContainSymbol = { ...dummyPayload, username: '$forumapi' };

      expect(() => new RegisterUser(usernameContainWhiteSpace))
        .toThrow('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
      expect(() => new RegisterUser(usernameContainSymbol))
        .toThrow('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { username, fullname, password } = new RegisterUser(payload);

      expect(username).toEqual(payload.username);
      expect(fullname).toEqual(payload.fullname);
      expect(password).toEqual(payload.password);
    });
  });
});
