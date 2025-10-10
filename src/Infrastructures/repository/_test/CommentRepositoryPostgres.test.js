const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  describe('CommentRepository contract enforcement', () => {
    it('must be an instance of CommentRepository', () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres();

      expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
    });
  });
});