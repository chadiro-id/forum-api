const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyMapper = require('../ReplyMapper');
const { createRawReply } = require('../../../../tests/util');
const Reply = require('../../../Domains/replies/entities/Reply');
const ReplyOwner = require('../../../Domains/replies/entities/ReplyOwner');

describe('ReplyMapper', () => {
  describe('mapAddedReplyToDomain', () => {
    it('should correctly map data to AddedReply domain entity', () => {
      const dbRow = {
        id: 'reply-123',
        content: 'Sebuah balasan',
        owner_id: 'user-456',
      };

      const result = ReplyMapper.mapAddedReplyToDomain(dbRow);

      expect(result).toStrictEqual(new AddedReply({
        id: dbRow.id,
        content: dbRow.content,
        owner: dbRow.owner_id,
      }));
    });
  });

  describe('mapReplyListToDomain', () => {
    it('should correctly map data list to array of Reply domain entity', () => {
      const row1 = createRawReply({ id: 'reply-001' });
      const row2 = createRawReply({ id: 'reply-002' });

      const expectedReply1 = new Reply({
        id: row1.id,
        commentId: row1.comment_id,
        content: row1.content,
        username: row1.username,
        date: row1.created_at,
        isDelete: row1.is_delete,
      });

      const expectedReply2 = new Reply({
        id: row2.id,
        commentId: row2.comment_id,
        content: row2.content,
        username: row2.username,
        date: row2.created_at,
        isDelete: row2.is_delete,
      });

      const result = ReplyMapper.mapReplyListToDomain([row1, row2]);
      expect(result).toStrictEqual([expectedReply1, expectedReply2]);
    });
  });

  describe('mapReplyOwnerToDomain', () => {
    it('should correctly map data to ReplyOwner domain entity', () => {
      const dbRow = { owner_id: 'user-123' };

      const result = ReplyMapper.mapReplyOwnerToDomain(dbRow);
      expect(result).toStrictEqual(new ReplyOwner({
        owner: dbRow.owner_id,
      }));
    });
  });
});