const Reply = require('../../../replies/entities/Reply');
const Comment = require('../Comment');

describe('Comment Entity', () => {
  const dummyPayload = {
    id: 'comment-123',
    content: 'Sebuah komentar',
    date: '2025-10-15T02:08:54.384Z',
    username: 'superuser',
    isDelete: false,
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingId = { ...dummyPayload };
      delete missingId.id;
      const missingContent = { ...dummyPayload };
      delete missingContent.content;
      const missingDate = { ...dummyPayload };
      delete missingDate.date;
      const missingUsername = { ...dummyPayload };
      delete missingUsername.username;

      const emptyId = { ...dummyPayload, id: '' };
      const emptyContent = { ...dummyPayload, content: '' };
      const emptyDate = { ...dummyPayload, date: '' };
      const emptyUsername = { ...dummyPayload, username: '' };

      expect(() => new Comment(missingId))
        .toThrow('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Comment(missingContent))
        .toThrow('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Comment(missingDate))
        .toThrow('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Comment(missingUsername))
        .toThrow('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Comment(emptyId))
        .toThrow('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Comment(emptyContent))
        .toThrow('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Comment(emptyDate))
        .toThrow('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Comment(emptyUsername))
        .toThrow('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const contentNotString = { ...dummyPayload, content: ['Komentar'] };
      const dateNotString = { ...dummyPayload, date: 2025 };
      const usernameNotString = { ...dummyPayload, username: true };

      expect(() => new Comment(idNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(contentNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(dateNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(usernameNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when date string is not valid', () => {
      const invalidDateString = { ...dummyPayload, date: 'date' };

      expect(() => new Comment(invalidDateString))
        .toThrow('COMMENT.INVALID_DATE_STRING');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { id, content, date, username } = new Comment(payload);

      expect(id).toEqual(payload.id);
      expect(content).toEqual(payload.content);
      expect(date).toEqual(payload.date);
      expect(username).toEqual(payload.username);
    });

    it('should correctly create the entity and not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const comment = new Comment(extraPayload);

      expect(comment.id).toEqual(extraPayload.id);
      expect(comment.content).toEqual(extraPayload.content);
      expect(comment.date).toEqual(extraPayload.date);
      expect(comment.username).toEqual(extraPayload.username);

      expect(comment.extra).toBeUndefined();
    });
  });

  describe('Replies', () => {
    it('should return empty array as default value', () => {
      const comment = new Comment(dummyPayload);

      const replies = comment.replies;

      expect(replies).toEqual(expect.any(Array));
      expect(replies).toHaveLength(0);
    });

    it('should throw error when set non-array value', () => {
      const numVal = 123;
      const stringVal = 'replies';
      const objVal = { replies: {} };

      const comment = new Comment(dummyPayload);

      expect(() => comment.replies = numVal)
        .toThrow('COMMENT.REPLIES_MUST_BE_AN_ARRAY');
      expect(() => comment.replies = stringVal)
        .toThrow('COMMENT.REPLIES_MUST_BE_AN_ARRAY');
      expect(() => comment.replies = objVal)
        .toThrow('COMMENT.REPLIES_MUST_BE_AN_ARRAY');
    });

    it('should throw error when value contain invalid element', () => {
      const reply = new Reply({ ...dummyPayload, commentId: dummyPayload.id, id: 'reply-123' });
      const arrContainString = [reply, '2'];
      const arrContainNum = [1, reply];

      const comment = new Comment(dummyPayload);

      expect(() => comment.replies = arrContainString)
        .toThrow('COMMENT.REPLIES_INVALID_ELEMENT');
      expect(() => comment.replies = arrContainNum)
        .toThrow('COMMENT.REPLIES_INVALID_ELEMENT');
    });

    it('should correctly set replies', () => {
      const comment = new Comment(dummyPayload);
      const reply = new Reply({ ...dummyPayload, id: 'reply-123', commentId: dummyPayload.id });
      comment.replies = [reply];

      const replies = comment.replies;

      expect(replies).toHaveLength(1);
    });

    it('should correctly serialize JSON', () => {
      const comment = new Comment({ ...dummyPayload });

      const jsonString = JSON.stringify(comment);
      const jsonObj = JSON.parse(jsonString);

      expect(jsonObj).toEqual({
        id: dummyPayload.id,
        content: dummyPayload.content,
        date: dummyPayload.date,
        username: dummyPayload.username,
        replies: [],
      });
    });
  });
});