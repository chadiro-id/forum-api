const AuthCredentialsPayload = require('../AuthCredentialsPayload');

describe('AuthCredentialsPayload Entity', () => {
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

      expect(() => new AuthCredentialsPayload(missingId))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AuthCredentialsPayload(missingUsername))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AuthCredentialsPayload(emptyId))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AuthCredentialsPayload(emptyUsername))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const usernameNotString = { ...dummyPayload, username: ['johndoe'] };

      expect(() => new AuthCredentialsPayload(idNotString))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AuthCredentialsPayload(usernameNotString))
        .toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { id, username } = new AuthCredentialsPayload(payload);

      expect(id).toEqual(payload.id);
      expect(username).toEqual(payload.username);
    });

    it('should not contain extra property', () => {
      const payload = { ...dummyPayload, extra: 'ekstra' };

      const { extra } = new AuthCredentialsPayload(payload);
      expect(extra).toBeUndefined();
    });
  });
});