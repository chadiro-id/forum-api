const AddedThreadEntity = require('../AddedThreadEntity');

describe('AddedThreadEntity', () => {
  const correctPayload = {
    id: 'id',
    title: 'title',
    owner: 'owner'
  };

  describe('when the given payload is wrong', () => {
    it('should throw error if payload not contain required property', () => {
      const missingId = { ...correctPayload };
      delete missingId.id;

      const missingTitle = { ...correctPayload };
      delete missingTitle.title;

      const missingOwner = { ...correctPayload };
      delete missingOwner.owner;

      const emptyId = { ...correctPayload, id: '' };
      const emptyTitle = { ...correctPayload, title: '' };
      const emptyOwner = { ...correctPayload, owner: '' };

      expect(() => new AddedThreadEntity(missingId)).toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(missingTitle)).toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(missingOwner)).toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(emptyId)).toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(emptyTitle)).toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(emptyOwner)).toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if payload property does not meet data type spesification', () => {
      const invalidIdType = { ...correctPayload, id: [1, 2, 3] };
      const invalidTitleType = { ...correctPayload, title: 123 };
      const invalidOwnerType = { ...correctPayload, owner: true };

      expect(() => new AddedThreadEntity(invalidIdType)).toThrow('ADDED_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedThreadEntity(invalidTitleType)).toThrow('ADDED_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new AddedThreadEntity(invalidOwnerType)).toThrow('ADDED_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('when the given payload is correct', () => {
    it('should create entity correctly', () => {
      const { id, title, owner } = new AddedThreadEntity(correctPayload);

      expect(id).toEqual(correctPayload.id);
      expect(title).toEqual(correctPayload.title);
      expect(owner).toEqual(correctPayload.owner);
    });

    it('should create entity correctly and not contain extra properties', () => {
      const extraPayload = { ...correctPayload, extra: 'something' };

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