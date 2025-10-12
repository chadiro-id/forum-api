const AddedComment = require('../AddedComment');

describe('AddedComment Entity', () => {
  const dummyPayload = {
    id: 'comment-123',
    content: 'Something comment',
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

      expect(() => new AddedComment(missingId))
        .toThrow('ADDED_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedComment(missingContent))
        .toThrow('ADDED_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedComment(missingOwner))
        .toThrow('ADDED_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedComment(emptyId))
        .toThrow('ADDED_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedComment(emptyContent))
        .toThrow('ADDED_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedComment(emptyOwner))
        .toThrow('ADDED_COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const contentNotString = { ...dummyPayload, content: ['content'] };
      const ownerNotString = { ...dummyPayload, owner: {} };

      expect(() => new AddedComment(idNotString))
        .toThrow('ADDED_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedComment(contentNotString))
        .toThrow('ADDED_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedComment(ownerNotString))
        .toThrow('ADDED_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { id, content, owner } = new AddedComment(payload);

      expect(id).toEqual(payload.id);
      expect(content).toEqual(payload.content);
      expect(owner).toEqual(payload.owner);
    });

    it('should correctly create the entity and not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const addedComment = new AddedComment(extraPayload);

      expect(addedComment.id).toEqual(extraPayload.id);
      expect(addedComment.content).toEqual(extraPayload.content);
      expect(addedComment.owner).toEqual(extraPayload.owner);

      expect(addedComment.extra).toBeUndefined();
    });
  });
});