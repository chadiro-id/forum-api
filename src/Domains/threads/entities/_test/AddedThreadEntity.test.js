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

      expect(() => new AddedThreadEntity(missingId)).toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(missingTitle)).toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new AddedThreadEntity(missingOwner)).toThrow('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });
});