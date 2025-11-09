const NewComment = require('../NewComment');

describe('NewComment Entity', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    content: 'Something comment',
    userId: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain property', () => {
      const missingThreadId = { ...dummyPayload };
      delete missingThreadId.threadId;
      const missingContent = { ...dummyPayload };
      delete missingContent.content;
      const missingUserId = { ...dummyPayload };
      delete missingUserId.userId;

      const emptyThreadId = { ...dummyPayload, threadId: '' };
      const emptyContent = { ...dummyPayload, content: '' };
      const emptyUserId = { ...dummyPayload, userId: '' };

      expect(() => new NewComment(missingThreadId))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(missingContent))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(missingUserId))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(emptyThreadId))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(emptyContent))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewComment(emptyUserId))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const threadIdNotString = { ...dummyPayload, threadId: 123 };
      const contentNotString = { ...dummyPayload, content: true };
      const userIdNotString = { ...dummyPayload, userId: {} };

      expect(() => new NewComment(threadIdNotString))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewComment(contentNotString))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewComment(userIdNotString))
        .toThrow('NEW_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { threadId, content, userId } = new NewComment(payload);

      expect(threadId).toEqual(payload.threadId);
      expect(content).toEqual(payload.content);
      expect(userId).toEqual(payload.userId);
    });
  });
});