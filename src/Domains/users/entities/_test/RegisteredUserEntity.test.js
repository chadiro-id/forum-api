const RegisteredUserEntity = require('../RegisteredUserEntity');

describe('RegisteredUserEntity', () => {
  const exampleValidPayload = {
    id: 'user-123',
    username: 'forumapi',
    fullname: 'Forum Api',
  };

  describe('when the given payload is not valid', () => {
    it('should throw error if payload not contain needed property', () => {
      const missingId = { ...exampleValidPayload };
      delete missingId.id;

      const missingUsername = { ...exampleValidPayload };
      delete missingUsername.username;

      const missingFullname = { ...exampleValidPayload };
      delete missingFullname.fullname;

      const emptyId = {
        ...exampleValidPayload,
        id: '',
      };
      const emptyUsername = {
        ...exampleValidPayload,
        username: '',
      };
      const emptyFullname = {
        ...exampleValidPayload,
        fullname: '',
      };

      expect(() => new RegisteredUserEntity(missingId))
        .toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUserEntity(missingUsername))
        .toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUserEntity(missingFullname))
        .toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUserEntity(emptyId))
        .toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUserEntity(emptyUsername))
        .toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUserEntity(emptyFullname))
        .toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if payload does not meet data type specification', () => {
      const idNotString = {
        ...exampleValidPayload,
        id: 123,
      };
      const usernameNotString = {
        ...exampleValidPayload,
        username: ['forumapi'],
      };
      const fullnameNotString = {
        ...exampleValidPayload,
        fullname: true,
      };

      expect(() => new RegisteredUserEntity(idNotString))
        .toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new RegisteredUserEntity(usernameNotString))
        .toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new RegisteredUserEntity(fullnameNotString))
        .toThrow('REGISTERED_USER_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('when the given payload is valid', () => {
    it('should create entity correctly', () => {
      const payload = { ...exampleValidPayload };

      const { id, username, fullname } = new RegisteredUserEntity(payload);

      expect(id).toEqual(payload.id);
      expect(username).toEqual(payload.username);
      expect(fullname).toEqual(payload.fullname);
    });

    it('should create entity correctly and not contain extra properties', () => {
      const extraPayload = {
        ...exampleValidPayload,
        extra: 'extra property',
      };

      const registeredUser = new RegisteredUserEntity(extraPayload);

      expect(registeredUser).toEqual(new RegisteredUserEntity({
        id: extraPayload.id,
        username: extraPayload.username,
        fullname: extraPayload.fullname,
      }));
      expect(registeredUser.extra).toBeUndefined();
    });
  });
});
