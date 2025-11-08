const DetailComment = require('../../../comments/entities/DetailComment');
const ThreadDetails = require('../ThreadDetails');

describe('ThreadDetails Entity', () => {
  const dummyPayload = {
    id: 'thread-123',
    title: 'Judul thread',
    body: 'Sebuah thread',
    date: new Date('2025-10-15T02:08:54.384Z'),
    username: 'superuser',
  };

  const dummyComment = {
    id: 'comment-123',
    content: 'Sebuah komentar',
    username: 'johndoe',
    date: new Date(2017, 10, 16),
    isDelete: false,
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
      const emptyUsername = { ...dummyPayload, username: '' };

      expect(() => new ThreadDetails(missingId))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(missingTitle))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(missingBody))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(missingDate))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(missingUsername))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(emptyId))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(emptyTitle))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(emptyBody))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(emptyUsername))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const titleNotString = { ...dummyPayload, title: ['Judul'] };
      const bodyNotString = { ...dummyPayload, body: {} };
      const dateNotStringOrObject = { ...dummyPayload, date: true };
      const usernameNotString = { ...dummyPayload, username: 69 };

      expect(() => new ThreadDetails(idNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new ThreadDetails(titleNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new ThreadDetails(bodyNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new ThreadDetails(dateNotStringOrObject))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new ThreadDetails(usernameNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when title has char more than 255', () => {
      const payload = { ...dummyPayload, title: 'Sebuah thread'.repeat(25) };

      expect(() => new ThreadDetails(payload))
        .toThrow('DETAIL_THREAD.TITLE_EXCEED_CHAR_LIMIT');
    });

    it('should throw error when date is not valid', () => {
      const dateString = { ...dummyPayload, date: 'Date' };
      const dateObj = { ...dummyPayload, date: new Date('date') };

      expect(() => new ThreadDetails(dateString))
        .toThrow('DETAIL_THREAD.DATE_INVALID');
      expect(() => new ThreadDetails(dateObj))
        .toThrow('DETAIL_THREAD.DATE_INVALID');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const comment = new DetailComment({ ...dummyComment });
      const payload = { ...dummyPayload, comments: [comment] };

      const { id, title, body, date, username, comments } = new ThreadDetails(payload);

      expect(id).toEqual(payload.id);
      expect(title).toEqual(payload.title);
      expect(body).toEqual(payload.body);
      expect(date).toEqual(payload.date);
      expect(username).toEqual(payload.username);
      expect(comments).toEqual([]);
    });

    it('should not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const ThreadDetails = new ThreadDetails(extraPayload);

      expect(ThreadDetails.id).toEqual(extraPayload.id);
      expect(ThreadDetails.title).toEqual(extraPayload.title);
      expect(ThreadDetails.body).toEqual(extraPayload.body);
      expect(ThreadDetails.date).toEqual(extraPayload.date);
      expect(ThreadDetails.username).toEqual(extraPayload.username);

      expect(ThreadDetails.extra).toBeUndefined();
    });
  });

  describe('Comments', () => {
    it('should return empty array as default value', () => {
      const ThreadDetails = new ThreadDetails(dummyPayload);

      const comments = ThreadDetails.comments;

      expect(comments).toEqual(expect.any(Array));
      expect(comments).toHaveLength(0);
    });

    it('should throw error when set non-array value', () => {
      const numVal = 123;
      const stringVal = 'comments';
      const objVal = { comments: {} };

      const ThreadDetails = new ThreadDetails(dummyPayload);

      expect(() => ThreadDetails.comments = numVal)
        .toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
      expect(() => ThreadDetails.comments = stringVal)
        .toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
      expect(() => ThreadDetails.comments = objVal)
        .toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
    });

    it('should throw error when value contain invalid element', () => {
      const comment = new DetailComment({ ...dummyComment });

      const arrContainString = [comment, 'comment'];
      const arrContainObj = [{}, comment];

      const thread = new ThreadDetails({ ...dummyPayload });

      expect(() => thread.comments = arrContainString)
        .toThrow('DETAIL_THREAD.COMMENTS_INVALID_ELEMENT');
      expect(() => thread.comments = arrContainObj)
        .toThrow('DETAIL_THREAD.COMMENTS_INVALID_ELEMENT');
    });

    it('should correctly set comments', () => {
      const comment = new DetailComment({ ...dummyComment });
      const ThreadDetails = new ThreadDetails(dummyPayload);
      ThreadDetails.comments = [comment, comment];

      const comments = ThreadDetails.comments;

      expect(comments).toHaveLength(2);
      expect(comments).toEqual([comment, comment]);
    });
  });

  describe('JSON Serialization', () => {
    it('should correctly serialize to JSON', () => {
      const comment = new DetailComment({ ...dummyComment });
      const payload1 = { ...dummyPayload };
      const payload2 = { ...dummyPayload, date: '2025-10-15T02:08:54.384Z' };

      const thread1 = new ThreadDetails(payload1);
      thread1.comments = [comment];
      const thread2 = new ThreadDetails(payload2);

      const json1 = thread1.toJSON();
      const json2 = thread2.toJSON();

      expect(json1.id).toEqual(payload1.id);
      expect(json1.title).toEqual(payload1.title);
      expect(json1.body).toEqual(payload1.body);
      expect(json1.date).toEqual(payload1.date.toISOString());
      expect(json1.username).toEqual(payload1.username);
      expect(json1.comments).toHaveLength(1);
      expect(json1.comments[0]).toBeInstanceOf(DetailComment);

      expect(json2.date).toEqual(new Date(payload2.date).toISOString());
    });
  });
});