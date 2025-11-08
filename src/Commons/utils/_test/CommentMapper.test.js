const Comment = require('../../../Domains/comments/entities/Comment');
const CommentMapper = require('../CommentMapper');
const { createRawComment } = require('../../../../tests/util');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentOwner = require('../../../Domains/comments/entities/CommentOwner');

describe('CommentMapper', () => {
  describe('mapAddedCommentToDomain', () => {
    it('should correctly map data to AddedComment domain entity', () => {
      const dbRow = {
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner_id: 'user-456',
      };

      const result = CommentMapper.mapAddedCommentToDomain(dbRow);
      expect(result).toStrictEqual(new AddedComment({
        id: dbRow.id,
        content: dbRow.content,
        owner: dbRow.owner_id,
      }));
    });
  });

  describe('mapCommentListToDomain', () => {
    it('should correctly map data list to array of Comment domain entity', () => {
      const row1 = createRawComment({ id: 'comment-001' });
      const row2 = createRawComment({ id: 'comment-002' });

      const expectedComments = [
        new Comment({
          id: row1.id,
          content: row1.content,
          username: row1.username,
          date: row1.created_at,
          isDelete: row1.is_delete,
        }),
        new Comment({
          id: row2.id,
          content: row2.content,
          username: row2.username,
          date: row2.created_at,
          isDelete: row2.is_delete,
        }),
      ];

      const result = CommentMapper.mapCommentListToDomain([row1, row2]);
      expect(result).toStrictEqual(expectedComments);
    });
  });

  describe('mapCommentOwnerToDomain', () => {
    it('should correctly map data to CommentOwner domain entity', () => {
      const dbRow = { owner_id: 'user-123' };

      const result = CommentMapper.mapCommentOwnerToDomain(dbRow);
      expect(result).toStrictEqual(new CommentOwner({ owner: dbRow.owner_id }));
    });
  });
});