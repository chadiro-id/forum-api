const NewReply = require('../NewReply');

describe('NewReply', () => {
  const dummyPayload = {
    commentId: 'comment-123',
    content: 'some reply',
    ownerId: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingCommentId = { ...dummyPayload };
      delete missingCommentId.commentId;
      const missingContent = { ...dummyPayload };
      delete missingContent.content;
      const missingOwnerId = { ...dummyPayload };
      delete missingOwnerId.ownerId;

      const emptyCommentId = { ...dummyPayload, commentId: '' };
      const emptyContent = { ...dummyPayload, content: '' };
      const emptyOwnerId = { ...dummyPayload, ownerId: '' };

      expect(() => new NewReply(missingCommentId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(missingContent))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(missingOwnerId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyCommentId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyContent))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyOwnerId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });
});