const NewComment = require('../NewComment');

describe('NewComment Entity', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    content: 'Something comment',
    owner: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain property', () => {
      const missingThreadId = { ...dummyPayload };
      delete missingThreadId.threadId;
      const missingContent = { ...dummyPayload };
      delete missingContent.content;
      const missingOwner = { ...dummyPayload };
      delete missingOwner.owner;

      const emptyThreadId = { ...dummyPayload, threadId: '' };
      const emptyContent = { ...dummyPayload, content: '' };
      const emptyOwner = { ...dummyPayload, owner: '' };

      expect(() => new NewComment(missingThreadId))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(missingContent))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(missingOwner))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(emptyThreadId))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(emptyContent))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(emptyOwner))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const threadIdNotString = { ...dummyPayload, threadId: 123 };
      const contentNotString = { ...dummyPayload, content: true };
      const ownerNotString = { ...dummyPayload, owner: {} };

      expect(() => new NewComment(threadIdNotString))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewComment(contentNotString))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewComment(ownerNotString))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { threadId, content, owner } = new NewComment(payload);

      expect(threadId).toEqual(payload.threadId);
      expect(content).toEqual(payload.content);
      expect(owner).toEqual(payload.owner);
    });
  });
});