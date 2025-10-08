const NewThreadEntity = require('../NewThreadEntity');

describe('NewThreadEntity', () => {
  const exampleValidPayload = {
    title: 'Title',
    body: 'body',
    owner: 'user-123'
  };

  describe('when the given payload is not valid', () => {
    it('should throw error if payload not contain needed property', () => {
      const missingTitle = { ...exampleValidPayload };
      delete missingTitle.title;

      const missingBody = { ...exampleValidPayload };
      delete missingBody.body;

      const missingOwner = { ...exampleValidPayload };
      delete missingOwner.owner;

      const emptyTitle = { ...exampleValidPayload, title: '' };
      const emptyBody = { ...exampleValidPayload, body: '' };
      const emptyOwner = { ...exampleValidPayload, owner: '' };

      expect(() => new NewThreadEntity(missingTitle))
        .toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(missingBody))
        .toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(missingOwner))
        .toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyTitle))
        .toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyBody))
        .toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyOwner))
        .toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
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
      const ownerNotString = {
        ...exampleValidPayload,
        owner: {},
      };

      expect(() => new NewThreadEntity(titleNotString))
        .toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThreadEntity(bodyNotString))
        .toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThreadEntity(ownerNotString))
        .toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('when the given payload is valid', () => {
    it('should create entity correctly', () => {
      const payload = { ...exampleValidPayload };

      const { title, body, owner } = new NewThreadEntity(payload);

      expect(title).toEqual(payload.title);
      expect(body).toEqual(payload.body);
      expect(owner).toEqual(payload.owner);
    });
  });
});