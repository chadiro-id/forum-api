const Comment = require('../../../Domains/comments/entities/Comment');
const CommentMapper = require('../CommentMapper');

describe('CommentMapper', () => {
  it('should correctly map database row to Comment entity', () => {
    const timestamp = new Date();
    const dbRow = {
      id: 'comment-123',
      content: 'Sebuah komentar',
      username: 'johndoe',
      created_at: timestamp,
      is_delete: false,
    };

    const comment = CommentMapper.toEntity(dbRow);
    expect(comment).toStrictEqual(new Comment({
      id: dbRow.id,
      content: dbRow.content,
      username: dbRow.username,
      date: dbRow.created_at,
      isDelete: dbRow.is_delete,
    }));
  });
});