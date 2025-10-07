const NewThreadEntity = require('../NewThreadEntity');

describe('NewThreadEntity', () => {
  const correctPayload = {
    title: 'Title',
    body: 'body',
  };

  describe('when the given payload is wrong', () => {
    it('should throw error id payload not contain required property', () => {
      const missingTitle = { ...correctPayload };
      delete missingTitle.title;

      const missingBody = { ...correctPayload };
      delete missingBody.body;

      const emptyTitle = { ...correctPayload, title: '' };
      const emptyBody = { ...correctPayload, body: '' };

      expect(() => new NewThreadEntity(missingTitle)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(missingBody)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyTitle)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new NewThreadEntity(emptyBody)).toThrow('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error if payload property does not meet data type specification', () => {
      const invalidTitle = { ...correctPayload, title: [1, 2, 3] };
      const invalidBody = { ...correctPayload, body: true };

      expect(() => new NewThreadEntity(invalidTitle)).toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new NewThreadEntity(invalidBody)).toThrow('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('when the given payload is correct', () => {
    it('should create entity correctly', () => {
      const { title, body } = new NewThreadEntity(correctPayload);

      expect(title).toEqual(correctPayload.title);
      expect(body).toEqual(correctPayload.body);
    });
  });
});