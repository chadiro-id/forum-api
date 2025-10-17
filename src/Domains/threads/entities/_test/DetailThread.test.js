const Comment = require('../../../comments/entities/Comment');
const DetailThread = require('../DetailThread');

describe('DetailThread Entity', () => {
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
      expect(() => new DetailThread(emptyUsername))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const titleNotString = { ...dummyPayload, title: ['Judul'] };
      const bodyNotString = { ...dummyPayload, body: {} };
      const dateNotStringOrObject = { ...dummyPayload, date: true };
      const usernameNotString = { ...dummyPayload, username: 69 };

      expect(() => new DetailThread(idNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DetailThread(titleNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DetailThread(bodyNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DetailThread(dateNotStringOrObject))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new DetailThread(usernameNotString))
        .toThrow('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when title has char more than 255', () => {
      const payload = { ...dummyPayload, title: 'Sebuah thread'.repeat(25) };

      expect(() => new DetailThread(payload))
        .toThrow('DETAIL_THREAD.TITLE_EXCEDD_CHAR_LIMIT');
    });

    it('should throw error when date is not valid', () => {
      const dateString = { ...dummyPayload, date: 'Date' };
      const dateObj = { ...dummyPayload, date: new Date('date') };

      expect(() => new DetailThread(dateString))
        .toThrow('DETAIL_THREAD.DATE_INVALID');
      expect(() => new DetailThread(dateObj))
        .toThrow('DETAIL_THREAD.DATE_INVALID');
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

    it('should not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const detailThread = new DetailThread(extraPayload);

      expect(detailThread.id).toEqual(extraPayload.id);
      expect(detailThread.title).toEqual(extraPayload.title);
      expect(detailThread.body).toEqual(extraPayload.body);
      expect(detailThread.date).toEqual(extraPayload.date);
      expect(detailThread.username).toEqual(extraPayload.username);

      expect(detailThread.extra).toBeUndefined();
    });
  });

  describe('Comments', () => {
    it('should return empty array as default value', () => {
      const detailThread = new DetailThread(dummyPayload);

      const comments = detailThread.comments;

      expect(comments).toEqual(expect.any(Array));
      expect(comments).toHaveLength(0);
    });

    it('should throw error when set non-array value', () => {
      const numVal = 123;
      const stringVal = 'comments';
      const objVal = { comments: {} };

      const detailThread = new DetailThread(dummyPayload);

      expect(() => detailThread.comments = numVal)
        .toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
      expect(() => detailThread.comments = stringVal)
        .toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
      expect(() => detailThread.comments = objVal)
        .toThrow('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
    });

    it('should throw error when value contain invalid element', () => {
      const comment = new Comment({ ...dummyComment });

      const arrContainString = [comment, 'comment'];
      const arrContainObj = [{}, comment];

      const thread = new DetailThread({ ...dummyPayload });

      expect(() => thread.comments = arrContainString)
        .toThrow('DETAIL_THREAD.COMMENTS_INVALID_ELEMENT');
      expect(() => thread.comments = arrContainObj)
        .toThrow('DETAIL_THREAD.COMMENTS_INVALID_ELEMENT');
    });

    it('should correctly set comments', () => {
      const comment = new Comment({ ...dummyComment });
      const detailThread = new DetailThread(dummyPayload);
      detailThread.comments = [comment, comment];

      const comments = detailThread.comments;

      expect(comments).toHaveLength(2);
      expect(comments).toEqual([comment, comment]);
    });
  });

  describe('JSON Serialization', () => {
    it('should correctly serialize to JSON', () => {
      const comment = new Comment({ ...dummyComment });
      const payload = { ...dummyPayload };

      const thread = new DetailThread(payload);
      thread.comments = [comment];

      const json = thread.toJSON();

      expect(json.id).toEqual(payload.id);
      expect(json.title).toEqual(payload.title);
      expect(json.body).toEqual(payload.body);
      expect(json.date).toEqual(payload.date);
      expect(json.username).toEqual(payload.username);
      expect(json.comments).toHaveLength(1);
      expect(json.comments[0]).toBeInstanceOf(Comment);
    });
  });
});