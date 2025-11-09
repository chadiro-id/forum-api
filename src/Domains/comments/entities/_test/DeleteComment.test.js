const DeleteComment = require('../DeleteComment');

describe('DeleteComment Entity', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    userId: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingThreadId = { ...dummyPayload };
      delete missingThreadId.threadId;
      const missingCommentId = { ...dummyPayload };
      delete missingCommentId.commentId;
      const missingUserId = { ...dummyPayload };
      delete missingUserId.userId;

      const emptyThreadId = { ...dummyPayload, threadId: '' };
      const emptyCommentId = { ...dummyPayload, commentId: '' };
      const emptyUserId = { ...dummyPayload, userId: '' };

      expect(() => new DeleteComment(missingThreadId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComment(missingCommentId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComment(missingUserId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComment(emptyThreadId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComment(emptyCommentId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComment(emptyUserId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const threadIdNotString = { ...dummyPayload, threadId: 123 };
      const commentIdNotString = { ...dummyPayload, commentId: [1, 2, 3] };
      const userIdNotString = { ...dummyPayload, userId: true };

      expect(() => new DeleteComment(threadIdNotString))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DeleteComment(commentIdNotString))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DeleteComment(userIdNotString))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const deleteComment = new DeleteComment(payload);

      expect(deleteComment.threadId).toEqual(payload.threadId);
      expect(deleteComment.commentId).toEqual(payload.commentId);
      expect(deleteComment.userId).toEqual(payload.userId);
    });
  });
});