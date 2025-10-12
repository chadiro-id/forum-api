const AddedReply = require('../AddedReply');

describe('AddedReply Entity', () => {
  const dummyPayload = {
    id: 'reply-123',
    content: 'Something reply',
    owner: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingId = { ...dummyPayload };
      delete missingId.id;
      const missingContent = { ...dummyPayload };
      delete missingContent.content;
      const missingOwner = { ...dummyPayload };
      delete missingOwner.owner;

      const emptyId = { ...dummyPayload, id: '' };
      const emptyContent = { ...dummyPayload, content: '' };
      const emptyOwner = { ...dummyPayload, owner: '' };

      expect(() => new AddedReply(missingId))
        .toThrow('ADDED_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedReply(missingContent))
        .toThrow('ADDED_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedReply(missingOwner))
        .toThrow('ADDED_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedReply(emptyId))
        .toThrow('ADDED_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedReply(emptyContent))
        .toThrow('ADDED_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedReply(emptyOwner))
        .toThrow('ADDED_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const contentNotString = { ...dummyPayload, content: true };
      const ownerNotString = { ...dummyPayload, owner: ['user-123'] };

      expect(() => new AddedReply(idNotString))
        .toThrow('ADDED_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedReply(contentNotString))
        .toThrow('ADDED_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedReply(ownerNotString))
        .toThrow('ADDED_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });
});