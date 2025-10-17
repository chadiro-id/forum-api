const Reply = require('../Reply');

describe('Reply Entity', () => {
  const dummyPayload = {
    id: 'reply-123',
    commentId: 'comment-123',
    content: 'Sebuah balasan',
    date: new Date('2025-10-15T02:08:54.384Z'),
    username: 'superuser',
    isDelete: false,
  };

  describe('Bad payload', () => {
    it('should throw error when payload not contain needed property', () => {
      const missingId = { ...dummyPayload };
      delete missingId.id;
      const missingCommentId = { ...dummyPayload };
      delete missingCommentId.commentId;
      const missingContent = { ...dummyPayload };
      delete missingContent.content;
      const missingDate = { ...dummyPayload };
      delete missingDate.date;
      const missingUsername = { ...dummyPayload };
      delete missingUsername.username;
      const missingIsDelete = { ...dummyPayload };
      delete missingIsDelete.isDelete;

      const emptyId = { ...dummyPayload, id: '' };
      const emptyCommentId = { ...dummyPayload, commentId: '' };
      const emptyContent = { ...dummyPayload, content: '' };
      const emptyUsername = { ...dummyPayload, username: '' };

      expect(() => new Reply(missingId))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(missingCommentId))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(missingContent))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(missingDate))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(missingUsername))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(missingIsDelete))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(emptyId))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(emptyCommentId))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(emptyContent))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(emptyUsername))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const commentIdNotString = { ...dummyPayload, commentId: {} };
      const contentNotString = { ...dummyPayload, content: ['Balasan'] };
      const usernameNotString = { ...dummyPayload, username: true };
      const dateNotStringOrObject = { ...dummyPayload, date: 2025 };
      const isDeleteNotBoolean = { ...dummyPayload, isDelete: 'delete' };

      expect(() => new Reply(idNotString))
        .toThrow('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Reply(commentIdNotString))
        .toThrow('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Reply(contentNotString))
        .toThrow('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Reply(usernameNotString))
        .toThrow('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Reply(dateNotStringOrObject))
        .toThrow('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Reply(isDeleteNotBoolean))
        .toThrow('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when date is not valid', () => {
      const dateString = { ...dummyPayload, date: 'date' };
      const dateObj = { ...dummyPayload, date: new Date('date') };

      expect(() => new Reply(dateString))
        .toThrow('REPLY.DATE_INVALID');
      expect(() => new Reply(dateObj))
        .toThrow('REPLY.DATE_INVALID');
    });
  });

  describe('Correct payload', () => {
    it('should correctly create the entity', () => {
      const payload = { ...dummyPayload };

      const { id, commentId, content, date, username } = new Reply(payload);

      expect(id).toEqual(payload.id);
      expect(commentId).toEqual(payload.commentId);
      expect(content).toEqual(payload.content);
      expect(date).toEqual(payload.date);
      expect(username).toEqual(payload.username);
    });

    it('should not reveal original content value when isDelete equal to TRUE', () => {
      const payload = { ...dummyPayload, isDelete: true };

      const { content } = new Reply(payload);

      expect(content).toEqual('**balasan telah dihapus**');
    });

    it('should not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const reply = new Reply(extraPayload);

      expect(reply.id).toEqual(extraPayload.id);
      expect(reply.commentId).toEqual(extraPayload.commentId);
      expect(reply.content).toEqual(extraPayload.content);
      expect(reply.date).toEqual(extraPayload.date);
      expect(reply.username).toEqual(extraPayload.username);

      expect(reply.extra).toBeUndefined();
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const payload = { ...dummyPayload };

      const reply = new Reply(payload);
      const json = reply.toJSON();

      expect(json.isDelete).toBeUndefined();
      expect(json.commentId).toBeUndefined();

      expect(json.id).toEqual(payload.id);
      expect(json.content).toEqual(payload.content);
      expect(json.date).toEqual(payload.date);
      expect(json.username).toEqual(payload.username);
    });
  });
});