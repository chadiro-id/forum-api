const NewReply = require('../NewReply');

describe('NewReply Entity', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    content: 'Something reply',
    userId: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingThreadId = { ...dummyPayload };
      delete missingThreadId.threadId;
      const missingCommentId = { ...dummyPayload };
      delete missingCommentId.commentId;
      const missingContent = { ...dummyPayload };
      delete missingContent.content;
      const missingUserId = { ...dummyPayload };
      delete missingUserId.userId;

      const emptyThreadId = { ...dummyPayload, threadId: '' };
      const emptyCommentId = { ...dummyPayload, commentId: '' };
      const emptyContent = { ...dummyPayload, content: '' };
      const emptyUserId = { ...dummyPayload, userId: '' };

      expect(() => new NewReply(missingThreadId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(missingCommentId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(missingContent))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(missingUserId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyThreadId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyCommentId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyContent))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyUserId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const threadIdNotString = { ...dummyPayload, threadId: {} };
      const commentIdNotString = { ...dummyPayload, commentId: 123 };
      const contentNotString = { ...dummyPayload, content: true };
      const userIdNotString = { ...dummyPayload, userId: ['user-123'] };

      expect(() => new NewReply(threadIdNotString))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewReply(commentIdNotString))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewReply(contentNotString))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewReply(userIdNotString))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { threadId, commentId, content, userId } = new NewReply(payload);

      expect(threadId).toEqual(payload.threadId);
      expect(commentId).toEqual(payload.commentId);
      expect(content).toEqual(payload.content);
      expect(userId).toEqual(payload.userId);
    });
  });
});