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
      const dateNotInstanceOfDate = { ...dummyPayload, date: 2025 };
      const usernameNotString = { ...dummyPayload, username: true };
      const isDeleteNotBoolean = { ...dummyPayload, isDelete: 'delete' };

      expect(() => new Comment(idNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(contentNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(dateNotInstanceOfDate))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(usernameNotString))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Comment(isDeleteNotBoolean))
        .toThrow('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when date is not valid', () => {
      const dateObj = { ...dummyPayload, date: new Date('date') };

      expect(() => new Comment(dateObj)).toThrow('COMMENT.DATE_INVALID');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const {
        id, username, content, date, isDelete
      } = new Comment({ ...dummyPayload });

      expect(id).toEqual(dummyPayload.id);
      expect(username).toEqual(dummyPayload.username);
      expect(content).toEqual(dummyPayload.content);
      expect(date).toEqual(dummyPayload.date);
      expect(isDelete).toBeUndefined();
    });

    it('should not reveal original content when isDelete equal to TRUE', () => {
      const payload = { ...dummyPayload, isDelete: true };

      const { content } = new Comment(payload);
      expect(content).toEqual('**komentar telah dihapus**');
    });

    it('should not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const comment = new Comment(extraPayload);
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
      const payload1 = { ...dummyPayload };
      const payload2 = { ...dummyPayload, date: '2025-10-15T02:08:54.384Z' };

      const comment1 = new Comment(payload1);
      const comment2 = new Comment(payload2);

      const json1 = comment1.toJSON();
      const json2 = comment2.toJSON();

      expect(json1.isDelete).toBeUndefined();
      expect(json1.id).toEqual(payload1.id);
      expect(json1.content).toEqual(payload1.content);
      expect(json1.date).toEqual(payload1.date.toISOString());
      expect(json1.username).toEqual(payload1.username);
      expect(json1.replies).toEqual([]);

      expect(json2.date).toEqual(new Date(payload2.date).toISOString());
    });
  });
});