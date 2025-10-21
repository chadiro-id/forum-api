const AuthenticationPayload = require('../AuthenticationPayload');

describe('AuthenticationPayload Entity', () => {
  const dummyPayload = {
    id: 'user-123',
    username: 'johndoe',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingId = { username: dummyPayload.username };
      const missingUsername = { id: dummyPayload.id };
      const emptyId = { ...dummyPayload, id: '' };
      const emptyUsername = { ...dummyPayload, username: '' };

      expect(() => new AuthenticationPayload(missingId))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AuthenticationPayload(missingUsername))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AuthenticationPayload(emptyId))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AuthenticationPayload(emptyUsername))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const usernameNotString = { ...dummyPayload, username: ['johndoe'] };

      expect(() => new AuthenticationPayload(idNotString))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AuthenticationPayload(usernameNotString))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { id, username } = new AuthenticationPayload(payload);

      expect(id).toEqual(payload.id);
      expect(username).toEqual(payload.username);
    });

    it('should correctly create the entity and not contain extra property', () => {
      const payload = { ...dummyPayload, extra: 'ekstra' };

      const { id, username, extra } = new AuthenticationPayload(payload);

      expect(id).toEqual(payload.id);
      expect(username).toEqual(payload.username);

      expect(extra).toBeUndefined();
    });
  });
});