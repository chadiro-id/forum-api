const DeleteComent = require('../DeleteComment');

describe('DeleteComment Entity', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    owner: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingThreadId = { ...dummyPayload };
      delete missingThreadId.threadId;
      const missingCommentId = { ...dummyPayload };
      delete missingCommentId.commentId;
      const missingOwner = { ...dummyPayload };
      delete missingOwner.owner;

      const emptyThreadId = { ...dummyPayload, threadId: '' };
      const emptyCommentId = { ...dummyPayload, commentId: '' };
      const emptyOwner = { ...dummyPayload, owner: '' };

      expect(() => new DeleteComent(missingThreadId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComent(missingCommentId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComent(missingOwner))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComent(emptyThreadId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComent(emptyCommentId))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DeleteComent(emptyOwner))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const threadIdNotString = { ...dummyPayload, threadId: 123 };
      const commentIdNotString = { ...dummyPayload, commentId: [1, 2, 3] };
      const ownerNotString = { ...dummyPayload, owner: true };

      expect(() => new DeleteComent(threadIdNotString))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DeleteComent(commentIdNotString))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DeleteComent(ownerNotString))
        .toThrow('DELETE_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const deleteComment = new DeleteComent(payload);

      expect(deleteComment.threadId).toEqual(payload.threadId);
      expect(deleteComment.commentId).toEqual(payload.commentId);
      expect(deleteComment.owner).toEqual(payload.owner);
    });
  });
});