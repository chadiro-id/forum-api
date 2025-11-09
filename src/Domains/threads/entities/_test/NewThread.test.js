const NewThread = require('../NewThread');

describe('NewThread Entity', () => {
  const dummyPayload = {
    title: 'Something thread title',
    body: 'Something thread body',
    userId: 'user-123',
  };

  describe('Bad Payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingTitle = { ...dummyPayload };
      delete missingTitle.title;
      const missingBody = { ...dummyPayload };
      delete missingBody.body;
      const missingUserId = { ...dummyPayload };
      delete missingUserId.userId;

      const emptyTitle = { ...dummyPayload, title: '' };
      const emptyBody = { ...dummyPayload, body: '' };
      const emptyUserId = { ...dummyPayload, userId: '' };

      expect(() => new NewThread(missingTitle))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(missingBody))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(missingUserId))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(emptyTitle))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(emptyBody))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(emptyUserId))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const titleNotString = { ...dummyPayload, title: 123 };
      const bodyNotString = { ...dummyPayload, body: true };
      const userIdNotString = { ...dummyPayload, userId: ['user-123'] };

      expect(() => new NewThread(titleNotString))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThread(bodyNotString))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThread(userIdNotString))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when title contains more than 255 character', () => {
      const payload = { ...dummyPayload, title: 'a'.repeat(256) };

      expect(() => new NewThread(payload))
        .toThrow('NEW_THREAD.TITLE_EXCEED_CHAR_LIMIT');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { title, body, userId } = new NewThread(payload);

      expect(title).toEqual(payload.title);
      expect(body).toEqual(payload.body);
      expect(userId).toEqual(payload.userId);
    });
  });
});