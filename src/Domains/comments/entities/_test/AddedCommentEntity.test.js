const AddedCommentEntity = require('../AddedCommentEntity');

describe('AddedCommentEntity', () => {
  const dummyPayload = {
    id: 'comment-123',
    content: 'content',
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

      expect(() => new AddedCommentEntity(missingId))
        .toThrow('ADDED_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedCommentEntity(missingContent))
        .toThrow('ADDED_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedCommentEntity(missingOwner))
        .toThrow('ADDED_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedCommentEntity(emptyId))
        .toThrow('ADDED_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedCommentEntity(emptyContent))
        .toThrow('ADDED_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedCommentEntity(emptyOwner))
        .toThrow('ADDED_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });
});