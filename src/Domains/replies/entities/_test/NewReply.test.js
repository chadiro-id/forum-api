const NewReply = require('../NewReply');

describe('NewReply Entity', () => {
  const dummyPayload = {
    commentId: 'comment-123',
    content: 'Something reply',
    owner: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingCommentId = { ...dummyPayload };
      delete missingCommentId.commentId;
      const missingContent = { ...dummyPayload };
      delete missingContent.content;
      const missingOwner = { ...dummyPayload };
      delete missingOwner.owner;

      const emptyCommentId = { ...dummyPayload, commentId: '' };
      const emptyContent = { ...dummyPayload, content: '' };
      const emptyOwner = { ...dummyPayload, owner: '' };

      expect(() => new NewReply(missingCommentId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(missingContent))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(missingOwner))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyCommentId))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyContent))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewReply(emptyOwner))
        .toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });
});