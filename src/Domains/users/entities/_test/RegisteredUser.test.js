const RegisteredUser = require('../RegisteredUser');

describe('RegisteredUser Entity', () => {
  const dummyPayload = {
    id: 'user-123',
    username: 'whoami',
    fullname: 'Who Am I',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingId = { ...dummyPayload };
      delete missingId.id;
      const missingUsername = { ...dummyPayload };
      delete missingUsername.username;
      const missingFullname = { ...dummyPayload };
      delete missingFullname.fullname;

      const emptyId = { ...dummyPayload, id: '' };
      const emptyUsername = { ...dummyPayload, username: '' };
      const emptyFullname = { ...dummyPayload, fullname: '' };

      expect(() => new RegisteredUser(missingId))
        .toThrow('REGISTERED_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUser(missingUsername))
        .toThrow('REGISTERED_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUser(missingFullname))
        .toThrow('REGISTERED_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUser(emptyId))
        .toThrow('REGISTERED_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUser(emptyUsername))
        .toThrow('REGISTERED_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new RegisteredUser(emptyFullname))
        .toThrow('REGISTERED_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const usernameNotString = { ...dummyPayload, username: ['forumapi'] };
      const fullnameNotString = { ...dummyPayload, fullname: true };

      expect(() => new RegisteredUser(idNotString))
        .toThrow('REGISTERED_USER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new RegisteredUser(usernameNotString))
        .toThrow('REGISTERED_USER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new RegisteredUser(fullnameNotString))
        .toThrow('REGISTERED_USER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { id, username, fullname } = new RegisteredUser(payload);

      expect(id).toEqual(payload.id);
      expect(username).toEqual(payload.username);
      expect(fullname).toEqual(payload.fullname);
    });

    it('should not contain extra properties', () => {
      const extraPayload = { ...dummyPayload, extra: 'extra property' };

      const registeredUser = new RegisteredUser(extraPayload);
      expect(registeredUser.extra).toBeUndefined();
    });
  });
});
