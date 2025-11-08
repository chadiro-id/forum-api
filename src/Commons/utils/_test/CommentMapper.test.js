const Comment = require('../../../Domains/comments/entities/Comment');
const CommentMapper = require('../CommentMapper');
const { createRawComment } = require('../../../../tests/util');

describe('CommentMapper', () => {
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
});