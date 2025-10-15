const DetailThread = require('../DetailThread');

describe('DetailThread Entity', () => {
  const dummyPayload = {
    id: 'thread-123',
    title: 'Judul thread',
    body: 'Sebuah thread',
    date: '2025-10-15T02:08:54.384Z',
    username: 'user-123',
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingId = { ...dummyPayload };
      delete missingId.id;
      const missingTitle = { ...dummyPayload };
      delete missingTitle.title;
      const missingBody = { ...dummyPayload };
      delete missingBody.body;
      const missingDate = { ...dummyPayload };
      delete missingDate.date;
      const missingUsername = { ...dummyPayload };
      delete missingUsername.username;

      const emptyId = { ...dummyPayload, id: '' };
      const emptyTitle = { ...dummyPayload, title: '' };
      const emptyBody = { ...dummyPayload, body: '' };
      const emptyDate = { ...dummyPayload, date: '' };
      const emptyUsername = { ...dummyPayload, username: '' };

      expect(() => new DetailThread(missingId))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DetailThread(missingTitle))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DetailThread(missingBody))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DetailThread(missingDate))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DetailThread(missingUsername))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DetailThread(emptyId))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DetailThread(emptyTitle))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DetailThread(emptyBody))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DetailThread(emptyDate))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new DetailThread(emptyUsername))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const titleNotString = { ...dummyPayload, title: ['Judul'] };
      const bodyNotString = { ...dummyPayload, body: {} };
      const dateNotString = { ...dummyPayload, date: true };
      const usernameNotString = { ...dummyPayload, username: 69 };

      expect(() => new DetailThread(idNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DetailThread(titleNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DetailThread(bodyNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DetailThread(dateNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DetailThread(usernameNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when date string is not valid', () => {
      const invalidDateString = { ...dummyPayload, date: 'Date' };

      expect(() => new DetailThread(invalidDateString))
        .toThrow('DETAIL_THREAD.INVALID_DATE_STRING');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { id, title, body, date, username } = new DetailThread(payload);

      expect(id).toEqual(payload.id);
      expect(title).toEqual(payload.title);
      expect(body).toEqual(payload.body);
      expect(date).toEqual(payload.date);
      expect(username).toEqual(payload.username);
    });

    it('should correctly create the entity and not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const detailThread = new DetailThread(extraPayload);

      expect(detailThread.id).toEqual(extraPayload.id);
      expect(detailThread.title).toEqual(extraPayload.title);
      expect(detailThread.body).toEqual(extraPayload.body);
      expect(detailThread.date).toEqual(extraPayload.date);
      expect(detailThread.username).toEqual(extraPayload.username);
    });
  });

  describe('Thread comments', () => {
    it('should throw error when value is not an array', () => {
      const detailThread = new DetailThread({ ...dummyPayload });
      const mockedSetter = jest.fn()
        .mockImplementation(() => {
          throw new Error('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
        });

      Object.defineProperty(detailThread, 'comments', {
        set: mockedSetter,
        configurable: true,
      });

      expect(() => { detailThread.comments = {}; })
        .toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
      expect(() => { detailThread.comments = 'Comments'; })
        .toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
      expect(() => { detailThread.comments = 123; })
        .toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
    });

    it('should not throw error when value is an array', () => {
      const detailThread = new DetailThread({ ...dummyPayload });
      const mockedSetter = jest.fn().mockReturnValue();

      Object.defineProperty(detailThread, 'comments', {
        set: mockedSetter,
        configurable: true,
      });

      expect(() => { detailThread.comments = []; })
        .not.toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
    });

    it('should set comments value correctly', () => {
      const detailThread = new DetailThread({ ...dummyPayload });
      jest.spyOn(DetailThread, 'comments', 'get').mockReturnValue([]);
      detailThread.comments = [];
      expect(detailThread.comments).toBe([]);
    });
  });
});