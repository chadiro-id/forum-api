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

      const expectedError = new Error('ADDED_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');

      expect(() => new AddedCommentEntity(missingId))
        .toThrow(expectedError);
      expect(() => new AddedCommentEntity(missingContent))
        .toThrow(expectedError);
      expect(() => new AddedCommentEntity(missingOwner))
        .toThrow(expectedError);
      expect(() => new AddedCommentEntity(emptyId))
        .toThrow(expectedError);
      expect(() => new AddedCommentEntity(emptyContent))
        .toThrow(expectedError);
      expect(() => new AddedCommentEntity(emptyOwner))
        .toThrow(expectedError);
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const contentNotString = { ...dummyPayload, content: true };
      const ownerNotString = { ...dummyPayload, owner: ['owner'] };

      const expectedError = new Error('ADDED_COMMENT_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');

      expect(() => new AddedCommentEntity(idNotString))
        .toThrow(expectedError);
      expect(() => new AddedCommentEntity(contentNotString))
        .toThrow(expectedError);
      expect(() => new AddedCommentEntity(ownerNotString))
        .toThrow(expectedError);
    });
  });

  describe('Correct payload', () => {
    it('should correctly create entity', () => {
      const payload = { ...dummyPayload };

      const { id, content, owner } = new AddedCommentEntity(payload);

      expect(id).toEqual(payload.id);
      expect(content).toEqual(payload.content);
      expect(owner).toEqual(payload.owner);
    });

    it('should correctly create entity and not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'something extra' };

      const addedComment = new AddedCommentEntity(extraPayload);

      expect(addedComment.id).toEqual(extraPayload.id);
      expect(addedComment.content).toEqual(extraPayload.content);
      expect(addedComment.owner).toEqual(extraPayload.owner);
      expect(addedComment.extra).toBeUndefined();
    });
  });
});