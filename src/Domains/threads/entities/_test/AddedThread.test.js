const AddedThread = require('../AddedThread');

describe('AddedThread entity', () => {
  const dummyPayload = {
    id: 'thread-123',
    title: 'Something thread title',
    owner: 'user-123'
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingId = { ...dummyPayload };
      delete missingId.id;
      const missingTitle = { ...dummyPayload };
      delete missingTitle.title;
      const missingOwner = { ...dummyPayload };
      delete missingOwner.owner;

      const emptyId = { ...dummyPayload, id: '' };
      const emptyTitle = { ...dummyPayload, title: '' };
      const emptyOwner = { ...dummyPayload, owner: '' };

      expect(() => new AddedThread(missingId))
        .toThrow('ADDED_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThread(missingTitle))
        .toThrow('ADDED_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThread(missingOwner))
        .toThrow('ADDED_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThread(emptyId))
        .toThrow('ADDED_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThread(emptyTitle))
        .toThrow('ADDED_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThread(emptyOwner))
        .toThrow('ADDED_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const titleNotString = { ...dummyPayload, title: {} };
      const ownerNotString = { ...dummyPayload, owner: true };

      expect(() => new AddedThread(idNotString))
        .toThrow('ADDED_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedThread(titleNotString))
        .toThrow('ADDED_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedThread(ownerNotString))
        .toThrow('ADDED_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when title exceed char limit', () => {
      const payload = {
        ...dummyPayload,
        title: 'a'.repeat(256),
      };

      expect(() => new AddedThread(payload))
        .toThrow('ADDED_THREAD.TITLE_EXCEED_CHAR_LIMIT');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { id, title, owner } = new AddedThread(payload);

      expect(id).toEqual(payload.id);
      expect(title).toEqual(payload.title);
      expect(owner).toEqual(payload.owner);
    });

    it('should not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const addedThread = new AddedThread(extraPayload);
      expect(addedThread.extra).toBeUndefined();
    });
  });
});