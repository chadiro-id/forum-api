const Reply = require('../../../replies/entities/Reply');
const Comment = require('../Comment');

describe('Comment Entity', () => {
  const dummyPayload = {
    id: 'comment-123',
    content: 'Sebuah komentar',
    date: new Date('2025-10-15T02:08:54.384Z'),
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
      const missingIsDelete = { ...dummyPayload };
      delete missingIsDelete.isDelete;

      const emptyId = { ...dummyPayload, id: '' };
      const emptyContent = { ...dummyPayload, content: '' };
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
      expect(() => new Comment(emptyUsername))
        .toThrow('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const contentNotString = { ...dummyPayload, content: ['Komentar'] };
      const dateNotStringOrObject = { ...dummyPayload, date: 2025 };
      const usernameNotString = { ...dummyPayload, username: true };
      const isDeleteNotBoolean = { ...dummyPayload, isDelete: 'delete' };

      expect(() => new Comment(idNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(contentNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(dateNotStringOrObject))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(usernameNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(isDeleteNotBoolean))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when date is not valid', () => {
      const dateString = { ...dummyPayload, date: 'date' };
      const dateObj = { ...dummyPayload, date: new Date('date') };

      expect(() => new Comment(dateString))
        .toThrow('COMMENT.DATE_INVALID');
      expect(() => new Comment(dateObj))
        .toThrow('COMMENT.DATE_INVALID');
    });

    it('should throw error when replies contain invalid element', () => {
      const reply = new Reply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'Sebuah balasan',
        username: 'johndoe',
        date: new Date(2025, 10, 17),
        isDelete: false
      });
      const arrContainString = [reply, '0'];
      const arrContainNum = [1, reply];

      const payload1 = { ...dummyPayload, replies: arrContainString };
      const payload2 = { ...dummyPayload, replies: arrContainNum };

      expect(() => new Comment(payload1))
        .toThrow('COMMENT.REPLIES_INVALID_ELEMENT');
      expect(() => new Comment(payload2))
        .toThrow('COMMENT.REPLIES_INVALID_ELEMENT');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const reply = new Reply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'Sebuah balasan',
        username: 'johndoe',
        date: new Date(2025, 10, 17),
        isDelete: false,
      });

      const payload = { ...dummyPayload, replies: [reply] };

      const { id, content, date, username, replies } = new Comment(payload);

      expect(id).toEqual(payload.id);
      expect(content).toEqual(payload.content);
      expect(date).toEqual(payload.date);
      expect(username).toEqual(payload.username);
      expect(replies).toHaveLength(1);
      expect(replies[0]).toBeInstanceOf(Reply);
    });

    it('should not reveal original content value when isDelete equal to TRUE', () => {
      const payload = { ...dummyPayload, isDelete: true };

      const { content } = new Comment(payload);

      expect(content).toEqual('**komentar telah dihapus**');
    });

    it('should not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const comment = new Comment(extraPayload);

      expect(comment.id).toEqual(extraPayload.id);
      expect(comment.content).toEqual(extraPayload.content);
      expect(comment.date).toEqual(extraPayload.date);
      expect(comment.username).toEqual(extraPayload.username);
      expect(comment.replies).toBeInstanceOf(Array);
      expect(comment.replies).toHaveLength(0);

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
      expect(replies[0]).toBeInstanceOf(Reply);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const payload = { ...dummyPayload };
      const comment = new Comment(payload);

      const json = comment.toJSON();

      expect(json.isDelete).toBeUndefined();
      expect(json.id).toEqual(payload.id);
      expect(json.content).toEqual(payload.content);
      expect(json.date).toEqual(payload.date.toISOString());
      expect(json.username).toEqual(payload.username);
      expect(json.replies).toEqual([]);
    });
  });
});