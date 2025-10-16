const Reply = require('../Reply');

describe('Reply Entity', () => {
  const dummyPayload = {
    id: 'reply-123',
    commentId: 'comment-123',
    content: 'Sebuah balasan',
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

      expect(() => new Reply(missingId))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(missingContent))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(missingDate))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(missingUsername))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(emptyId))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(emptyContent))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(emptyDate))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      expect(() => new Reply(emptyUsername))
        .toThrow('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', () => {
      const idNotString = { ...dummyPayload, id: 123 };
      const contentNotString = { ...dummyPayload, content: ['Balasan'] };
      const dateNotString = { ...dummyPayload, date: 2025 };
      const usernameNotString = { ...dummyPayload, username: true };

      expect(() => new Reply(idNotString))
        .toThrow('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Reply(contentNotString))
        .toThrow('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Reply(dateNotString))
        .toThrow('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      expect(() => new Reply(usernameNotString))
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

      const { id, content, date, username } = new Reply(payload);

      expect(id).toEqual(payload.id);
      expect(content).toEqual(payload.content);
      expect(date).toEqual(payload.date);
      expect(username).toEqual(payload.username);
    });

    it('should correctly create the entity and not contain extra property', () => {
      const extraPayload = { ...dummyPayload, extra: 'Something extra' };

      const reply = new Reply(extraPayload);

      expect(reply.id).toEqual(extraPayload.id);
      expect(reply.content).toEqual(extraPayload.content);
      expect(reply.date).toEqual(extraPayload.date);
      expect(reply.username).toEqual(extraPayload.username);

      expect(reply.extra).toBeUndefined();
    });
  });
});