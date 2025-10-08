const RegisterUserEntity = require('../RegisterUserEntity');

describe('RegisterUserEntity', () => {
  const exampleValidPayload = {
    username: 'forumapi',
    password: 'secret',
    fullname: 'Forum Api',
  };

  describe('when the given payload is not valid', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingUsername = { ...exampleValidPayload };
      delete missingUsername.username;

      const missingPassword = { ...exampleValidPayload };
      delete missingPassword.password;

      const missingFullname = { ...exampleValidPayload };
      delete missingFullname.fullname;

      const emptyUsername = {
        ...exampleValidPayload,
        username: '',
      };
      const emptyPassword = {
        ...exampleValidPayload,
        password: '',
      };
      const emptyFullname = {
        ...exampleValidPayload,
        fullname: '',
      };

      expect(() => new RegisterUserEntity(missingUsername))
        .toThrow('REGISTER_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUserEntity(missingPassword))
        .toThrow('REGISTER_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUserEntity(missingFullname))
        .toThrow('REGISTER_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUserEntity(emptyUsername))
        .toThrow('REGISTER_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUserEntity(emptyPassword))
        .toThrow('REGISTER_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisterUserEntity(emptyFullname))
        .toThrow('REGISTER_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
      const usernameNotString = {
        ...exampleValidPayload,
        username: 123,
      };

      const passwordNotString = {
        ...exampleValidPayload,
        password: true,
      };

      const fullnameNotString = {
        ...exampleValidPayload,
        fullname: ['Forum Api'],
      };

      expect(() => new RegisterUserEntity(usernameNotString))
        .toThrow('REGISTER_USER_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new RegisterUserEntity(passwordNotString))
        .toThrow('REGISTER_USER_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new RegisterUserEntity(fullnameNotString))
        .toThrow('REGISTER_USER_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when username contains more than 50 character', () => {
      const payload = {
        ...exampleValidPayload,
        username: 'forumapiforumapiforumapiforumapiforumapiforumapifor',
      };

      expect(() => new RegisterUserEntity(payload))
        .toThrow('REGISTER_USER_ENTITY.USERNAME_EXCEED_CHAR_LIMIT');
    });

    it('should throw error when username contains restricted character', () => {
      const usernameContainWhiteSpace = {
        ...exampleValidPayload,
        username: 'forum api',
      };

      const usernameContainSymbol = {
        ...exampleValidPayload,
        username: '$forumapi',
      };

      expect(() => new RegisterUserEntity(usernameContainWhiteSpace))
        .toThrow('REGISTER_USER_ENTITY.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
      expect(() => new RegisterUserEntity(usernameContainSymbol))
        .toThrow('REGISTER_USER_ENTITY.USERNAME_CONTAIN_RESTRICTED_CHARACTER');
    });
  });

  describe('when the given payload is valid', () => {
    it('should create entity correctly', () => {
      const payload = { ...exampleValidPayload };

      const { username, fullname, password } = new RegisterUserEntity(payload);

      expect(username).toEqual(payload.username);
      expect(fullname).toEqual(payload.fullname);
      expect(password).toEqual(payload.password);
    });
  });
});
