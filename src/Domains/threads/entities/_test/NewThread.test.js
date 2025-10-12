const NewThread = require('../NewThread');

describe('NewThread entity', () => {
  const dummyPayload = {
    title: 'Something thread title',
    body: 'Something thread body',
    owner: 'user-123',
  };

  describe('Payload is bad', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingTitle = { ...dummyPayload };
      delete missingTitle.title;
      const missingBody = { ...dummyPayload };
      delete missingBody.body;
      const missingOwner = { ...dummyPayload };
      delete missingOwner.owner;

      const emptyTitle = { ...dummyPayload, title: '' };
      const emptyBody = { ...dummyPayload, body: '' };
      const emptyOwner = { ...dummyPayload, owner: '' };

      expect(() => new NewThread(missingTitle))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(missingBody))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(missingOwner))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(emptyTitle))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(emptyBody))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThread(emptyOwner))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const titleNotString = { ...dummyPayload, title: 123 };
      const bodyNotString = { ...dummyPayload, body: true };
      const ownerNotString = { ...dummyPayload, owner: ['user-123'] };

      expect(() => new NewThread(titleNotString))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThread(bodyNotString))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThread(ownerNotString))
        .toThrow('NEW_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Payload is correct', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { title, body, owner } = new NewThread(payload);

      expect(title).toEqual(payload.title);
      expect(body).toEqual(payload.body);
      expect(owner).toEqual(payload.owner);
    });
  });
});