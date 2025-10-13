const DetailThread = require('../DetailThread');

describe('DetailThreadEntity', () => {
  const correctPayload = {
    id: 'id',
    title: 'title',
    body: 'body',
    date: '',
    username: '',
    comments: []
  };

  describe('when the given payload is invalid', () => {
    it('should throw error if not contain needed property', () => {
      const missingId = { ...correctPayload };
      delete missingId.id;

      expect(() => new DetailThread(missingId)).toThrow('DETAIL_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    });
  });
});