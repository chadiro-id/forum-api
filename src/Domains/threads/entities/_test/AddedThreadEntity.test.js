const AddedThreadEntity = require('../AddedThreadEntity');

describe('AddedThreadEntity', () => {
  const exampleValidPayload = {
    id: 'thread-123',
    title: 'title',
    owner: 'owner',
  };

  describe('when the given payload is not valid', () => {
    it('should throw error if payload not contain needed property', () => {
      const missingId = { ...exampleValidPayload };
      delete missingId.id;

      const missingTitle = { ...exampleValidPayload };
      delete missingTitle.title;

      const missingOwner = { ...exampleValidPayload };
      delete missingOwner.owner;

      const emptyId = { ...exampleValidPayload, id: '' };
      const emptyTitle = { ...exampleValidPayload, title: '' };
      const emptyOwner = { ...exampleValidPayload, owner: '' };

      expect(() => new AddedThreadEntity(missingId))
        .toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(missingTitle))
        .toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(missingOwner))
        .toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(emptyId))
        .toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(emptyTitle))
        .toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(emptyOwner))
        .toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if payload property does not meet data type spesification', () => {
      const idNotString = {
        ...exampleValidPayload,
        id: [1, 2, 3],
      };
      const titleNotString = {
        ...exampleValidPayload,
        title: 123,
      };
      const ownerNotString = {
        ...exampleValidPayload,
        owner: true,
      };

      expect(() => new AddedThreadEntity(idNotString))
        .toThrow('ADDED_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedThreadEntity(titleNotString))
        .toThrow('ADDED_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedThreadEntity(ownerNotString))
        .toThrow('ADDED_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('when the given payload is valid', () => {
    it('should create entity correctly', () => {
      const payload = { ...exampleValidPayload };

      const { id, title, owner } = new AddedThreadEntity(payload);

      expect(id).toEqual(payload.id);
      expect(title).toEqual(payload.title);
      expect(owner).toEqual(payload.owner);
    });

    it('should create entity correctly and not contain extra properties', () => {
      const extraPayload = {
        ...exampleValidPayload,
        extra: 'extra property',
      };

      const addedThread = new AddedThreadEntity(extraPayload);

      expect(addedThread).toEqual({
        id: extraPayload.id,
        title: extraPayload.title,
        owner: extraPayload.owner,
      });
      expect(addedThread.extra).toBeUndefined();
    });
  });
});