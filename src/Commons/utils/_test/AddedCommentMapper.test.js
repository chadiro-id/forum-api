const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddedCommentMapper = require('../AddedCommentMapper');

describe('AddedCommentMapper', () => {
  it('should correctly map database row to AddedComment entity', () => {
    const dbRow = {
      id: 'comment-123',
      content: 'Sebuah komentar',
      owner_id: 'user-456',
    };

    const addedComment = AddedCommentMapper.toEntity(dbRow);

    expect(addedComment).toStrictEqual(new AddedComment({
      id: dbRow.id,
      content: dbRow.content,
      owner: dbRow.owner_id,
    }));
  });
});