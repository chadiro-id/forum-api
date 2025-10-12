const AddedThread = require('../AddedThread');

describe('AddedThread entity', () => {
  const dummyPayload = {
    id: 'thread-123',
    title: 'Something thread title',
    owner: 'user-123'
  };

  describe('Payload is bad', () => {
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
  });
});