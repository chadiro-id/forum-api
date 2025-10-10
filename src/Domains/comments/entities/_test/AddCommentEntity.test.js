const AddCommentEntity = require('../AddCommentEntity');

describe('AddCommentEntity', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    content: 'some content',
    ownerId: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingThreadId = { ...dummyPayload };
      delete missingThreadId.threadId;
      const missingContent = { ...dummyPayload };
      delete missingContent.content;
      const missingOwnerId = { ...dummyPayload };
      delete missingOwnerId.ownerId;

      const emptyThreadId = { ...dummyPayload, threadId: '' };
      const emptyContent = { ...dummyPayload, content: '' };
      const emptyOwnerId = { ...dummyPayload, ownerId: '' };

      const expectedError = new Error('ADD_COMMENT_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');

      expect(() => new AddCommentEntity(missingThreadId))
        .toThrow(expectedError);
      expect(() => new AddCommentEntity(missingContent))
        .toThrow(expectedError);
      expect(() => new AddCommentEntity(missingOwnerId))
        .toThrow(expectedError);
      expect(() => new AddCommentEntity(emptyThreadId))
        .toThrow(expectedError);
      expect(() => new AddCommentEntity(emptyContent))
        .toThrow(expectedError);
      expect(() => new AddCommentEntity(emptyOwnerId))
        .toThrow(expectedError);
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const threadIdNotString = { ...dummyPayload, threadId: 123 };
      const contentNotString = { ...dummyPayload, content: ['some content'] };
      const ownerIdNotString = { ...dummyPayload, ownerId: true };

      const expectedError = new Error('ADD_COMMENT_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');

      expect(() => new AddCommentEntity(threadIdNotString))
        .toThrow(expectedError);
      expect(() => new AddCommentEntity(contentNotString))
        .toThrow(expectedError);
      expect(() => new AddCommentEntity(ownerIdNotString))
        .toThrow(expectedError);
    });
  });
});