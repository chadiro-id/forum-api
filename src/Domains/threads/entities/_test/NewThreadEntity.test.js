const NewThreadEntity = require('../NewThreadEntity');

describe('NewThreadEntity', () => {
  const exampleValidPayload = {
    title: 'Title',
    body: 'body',
    userId: 'user-123'
  };

  describe('when the given payload is not valid', () => {
    it('should throw error if payload not contain needed property', () => {
      const missingTitle = { ...exampleValidPayload };
      delete missingTitle.title;

      const missingBody = { ...exampleValidPayload };
      delete missingBody.body;

      const missingUserId = { ...exampleValidPayload };
      delete missingUserId.userId;

      const emptyTitle = { ...exampleValidPayload, title: '' };
      const emptyBody = { ...exampleValidPayload, body: '' };
      const emptyUserId = { ...exampleValidPayload, userId: '' };

      expect(() => new NewThreadEntity(missingTitle))
        .toThrow('NEW_THREAD_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(missingBody))
        .toThrow('NEW_THREAD_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(missingUserId))
        .toThrow('NEW_THREAD_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyTitle))
        .toThrow('NEW_THREAD_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyBody))
        .toThrow('NEW_THREAD_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyUserId))
        .toThrow('NEW_THREAD_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if payload does not meet data type specification', () => {
      const titleNotString = {
        ...exampleValidPayload,
        title: [1, 2, 3],
      };
      const bodyNotString = {
        ...exampleValidPayload,
        body: true,
      };
      const userIdNotString = {
        ...exampleValidPayload,
        userId: {},
      };

      expect(() => new NewThreadEntity(titleNotString))
        .toThrow('NEW_THREAD_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThreadEntity(bodyNotString))
        .toThrow('NEW_THREAD_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThreadEntity(userIdNotString))
        .toThrow('NEW_THREAD_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('when the given payload is valid', () => {
    it('should create entity correctly', () => {
      const payload = { ...exampleValidPayload };

      const { title, body, userId } = new NewThreadEntity(payload);

      expect(title).toEqual(payload.title);
      expect(body).toEqual(payload.body);
      expect(userId).toEqual(payload.userId);
    });
  });
});