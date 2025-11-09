const DeleteReply = require('../DeleteReply');

describe('DeleteReply Entity', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    replyId: 'reply-123',
    userId: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingThreadId = { ...dummyPayload };
      delete missingThreadId.threadId;
      const missingCommentId = { ...dummyPayload };
      delete missingCommentId.commentId;
      const missingReplyId = { ...dummyPayload };
      delete missingReplyId.replyId;
      const missingUserId = { ...dummyPayload };
      delete missingUserId.userId;

      const emptyThreadId = { ...dummyPayload, threadId: '' };
      const emptyCommentId = { ...dummyPayload, commentId: '' };
      const emptyReplyId = { ...dummyPayload, replyId: '' };
      const emptyUserId = { ...dummyPayload, userId: '' };

      expect(() => new DeleteReply(missingThreadId))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteReply(missingCommentId))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteReply(missingReplyId))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteReply(missingUserId))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteReply(emptyThreadId))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteReply(emptyCommentId))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteReply(emptyReplyId))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteReply(emptyUserId))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () =>{
      const threadIdNotString = { ...dummyPayload, threadId: 123 };
      const commentIdNotString = { ...dummyPayload, commentId: [1, 2, 3] };
      const replyIdNotString = { ...dummyPayload, replyId: {} };
      const userIdNotString = { ...dummyPayload, userId: true };

      expect(() => new DeleteReply(threadIdNotString))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DeleteReply(commentIdNotString))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DeleteReply(replyIdNotString))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DeleteReply(userIdNotString))
        .toThrow('DELETE_REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const deleteReply = new DeleteReply(payload);

      expect(deleteReply.threadId).toEqual(payload.threadId);
      expect(deleteReply.commentId).toEqual(payload.commentId);
      expect(deleteReply.replyId).toEqual(payload.replyId);
      expect(deleteReply.userId).toEqual(payload.userId);
    });
  });
});