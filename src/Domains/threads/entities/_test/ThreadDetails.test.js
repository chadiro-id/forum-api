const Comment = require('../../../comments/entities/Comment');
const ThreadDetails = require('../ThreadDetails');

describe('ThreadDetails Entity', () => {
  const dummyPayload = {
    id: 'thread-123',
    title: 'Judul thread',
    body: 'Sebuah thread',
    date: new Date('2025-10-15T01:00:00.000Z'),
    username: 'superuser',
  };

  const dummyComment = {
    id: 'comment-123',
    content: 'Sebuah komentar',
    username: 'johndoe',
    date: new Date('2025-10-15T02:00:00.000Z'),
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
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(missingTitle))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(missingBody))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(missingDate))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(missingUsername))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(emptyId))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(emptyTitle))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(emptyBody))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new ThreadDetails(emptyUsername))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const titleNotString = { ...dummyPayload, title: ['Judul'] };
      const bodyNotString = { ...dummyPayload, body: {} };
      const dateNotInstanceOfDate = { ...dummyPayload, date: true };
      const usernameNotString = { ...dummyPayload, username: 69 };

      expect(() => new ThreadDetails(idNotString))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new ThreadDetails(titleNotString))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new ThreadDetails(bodyNotString))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new ThreadDetails(dateNotInstanceOfDate))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new ThreadDetails(usernameNotString))
        .toThrow('THREAD_DETAILS.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when title has char more than 255', () => {
      const payload = {
        ...dummyPayload,
        title: 'a'.repeat(256),
      };

      expect(() => new ThreadDetails(payload))
        .toThrow('THREAD_DETAILS.TITLE_EXCEED_CHAR_LIMIT');
    });

    it('should throw error when date is not valid', () => {
      const invalidDate = { ...dummyPayload, date: new Date('date') };

      expect(() => new ThreadDetails(invalidDate))
        .toThrow('THREAD_DETAILS.DATE_INVALID');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const comment = new Comment({ ...dummyComment });
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

      const threadDetails = new ThreadDetails(extraPayload);
      expect(threadDetails.extra).toBeUndefined();
    });
  });

  describe('Comments', () => {
    it('should return empty array as default value', () => {
      const thread = new ThreadDetails(dummyPayload);

      const comments = thread.comments;
      expect(comments).toStrictEqual([]);
    });

    it('should throw error when set non-array value', () => {
      const numVal = 123;
      const stringVal = 'comments';
      const objVal = { comments: {} };

      const thread = new ThreadDetails(dummyPayload);

      expect(() => thread.comments = numVal)
        .toThrow('THREAD_DETAILS.COMMENTS_MUST_BE_AN_ARRAY');
      expect(() => thread.comments = stringVal)
        .toThrow('THREAD_DETAILS.COMMENTS_MUST_BE_AN_ARRAY');
      expect(() => thread.comments = objVal)
        .toThrow('THREAD_DETAILS.COMMENTS_MUST_BE_AN_ARRAY');
    });

    it('should throw error when value contain invalid element', () => {
      const comment = new Comment({ ...dummyComment });

      const arrContainString = [comment, 'comment'];
      const arrContainObj = [{}, comment];

      const thread = new ThreadDetails({ ...dummyPayload });

      expect(() => thread.comments = arrContainString)
        .toThrow('THREAD_DETAILS.COMMENTS_INVALID_ELEMENT');
      expect(() => thread.comments = arrContainObj)
        .toThrow('THREAD_DETAILS.COMMENTS_INVALID_ELEMENT');
    });

    it('should correctly set comments', () => {
      const comment = new Comment({ ...dummyComment });
      const thread = new ThreadDetails(dummyPayload);
      thread.comments = [comment, comment];

      const comments = thread.comments;
      expect(comments).toStrictEqual([comment, comment]);
    });
  });

  describe('JSON Serialization', () => {
    it('should correctly serialize to JSON', () => {
      const comment = new Comment({ ...dummyComment });

      const thread = new ThreadDetails({ ...dummyPayload });
      thread.comments = [comment];

      const jsonString = JSON.stringify(thread);
      const json = JSON.parse(jsonString);

      expect(json).toStrictEqual({
        id: dummyPayload.id,
        title: dummyPayload.title,
        body: dummyPayload.body,
        username: dummyPayload.username,
        date: dummyPayload.date.toISOString(),
        comments: [
          {
            id: dummyComment.id,
            content: dummyComment.content,
            username: dummyComment.username,
            date: dummyComment.date.toISOString(),
            replies: [],
          },
        ],
      });
    });
  });
});