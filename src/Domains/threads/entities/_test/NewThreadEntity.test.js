const NewThreadEntity = require('../NewThreadEntity');

describe('NewThreadEntity', () => {
  const correctPayload = {
    title: 'Title',
    body: 'body',
    owner: 'user-123'
  };

  describe('when the given payload is wrong', () => {
    it('should throw error if payload not contain required property', () => {
      const missingTitle = { ...correctPayload };
      delete missingTitle.title;

      const missingBody = { ...correctPayload };
      delete missingBody.body;

      const missingOwner = { ...correctPayload };
      delete missingOwner.owner;

      const emptyTitle = { ...correctPayload, title: '' };
      const emptyBody = { ...correctPayload, body: '' };
      const emptyOwner = { ...correctPayload, owner: '' };

      expect(() => new NewThreadEntity(missingTitle)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(missingBody)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(missingOwner)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyTitle)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyBody)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyOwner)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if payload property does not meet data type specification', () => {
      const invalidTitle = { ...correctPayload, title: [1, 2, 3] };
      const invalidBody = { ...correctPayload, body: true };
      const invalidOwner = { ...correctPayload, owner: {} };

      expect(() => new NewThreadEntity(invalidTitle)).toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThreadEntity(invalidBody)).toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThreadEntity(invalidOwner)).toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('when the given payload is correct', () => {
    it('should create entity correctly', () => {
      const { title, body, owner } = new NewThreadEntity(correctPayload);

      expect(title).toEqual(correctPayload.title);
      expect(body).toEqual(correctPayload.body);
      expect(owner).toEqual(correctPayload.owner);
    });
  });
});