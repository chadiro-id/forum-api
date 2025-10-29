const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const { createRawComment } = require('../../../../tests/util');
const {
  assertQueryCalled,
  expectCommentFromRepository,
}= require('../../../../tests/helper/assertionsHelper');

describe('[Mock-Based Integration] CommentRepositoryPostgres', () => {
  it('must be an instance of CommentRepository', () => {
    const repo = new CommentRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(CommentRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let commentRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      commentRepo = new CommentRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addComment', () => {
      it('should correctly persist the NewComment and return AddedComment', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-123', content: 'Sebuah komentar', owner_id: 'user-123' }],
          rowCount: 1,
        });

        const addedComment = await commentRepo.addComment(new NewComment({
          threadId: 'thread-123',
          content: 'Sebuah komentar',
          owner: 'user-123',
        }));

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('INSERT INTO comments'),
          })
        );
        const calledValues = mockPool.query.mock.calls[0][0].values;
        expect(calledValues[0]).toEqual('comment-123');
        expect(calledValues[1]).toEqual('thread-123');
        expect(calledValues[2]).toEqual('user-123');
        expect(calledValues[3]).toEqual('Sebuah komentar');

        expect(addedComment).toEqual(new AddedComment({
          id: 'comment-123',
          content: 'Sebuah komentar',
          owner: 'user-123',
        }));
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(commentRepo.addComment({}))
          .rejects.toThrow('Database fails');
      });
    });

    describe('getCommentsByThreadId', () => {
      it('should correctly pool.query and return the array of comment', async () => {
        const comment1 = createRawComment({ id: 'comment-001' });
        const comment2 = createRawComment({ id: 'comment-002', username: 'dicoder', is_delete: true });

        mockPool.query.mockResolvedValue({
          rows: [comment1, comment2],
          rowCount: 3,
        });

        const comments = await commentRepo.getCommentsByThreadId('thread-123');

        assertQueryCalled(mockPool.query, 'SELECT', ['thread-123']);

        expect(comments).toHaveLength(2);
        expectCommentFromRepository(comments[0], { ...comment1 });
        expectCommentFromRepository(comments[1], { ...comment2 });
      });

      it('should return an empty array when no comment found', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0,
        });

        const comments = await commentRepo.getCommentsByThreadId('thread-id');
        expect(comments).toEqual([]);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(commentRepo.getCommentsByThreadId({}))
          .rejects.toThrow('Database fails');
      });
    });

    describe('softDeleteCommentById', () => {
      it('should correctly resolve and not throw error', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-123' }],
          rowCount: 1
        });

        await expect(commentRepo.softDeleteCommentById('comment-123'))
          .resolves.not.toThrow();

        assertQueryCalled(
          mockPool.query, 'UPDATE comments SET is_delete = TRUE', ['comment-123']
        );
      });

      it('should throw NotFoundError when id not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(commentRepo.softDeleteCommentById('comment-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(commentRepo.softDeleteCommentById({}))
          .rejects.toThrow('Database fails');
      });
    });

    describe('verifyCommentBelongToThread', () => {
      it('should correctly resolve and not throw error', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ thread_id: 'thread-123' }], rowCount: 1
        });

        await expect(commentRepo.verifyCommentBelongToThread('comment-123', 'thread-123'))
          .resolves.not.toThrow();

        assertQueryCalled(mockPool.query, 'SELECT thread_id FROM comments', ['comment-123']);
      });

      it('should throw NotFoundError when comment not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(commentRepo.verifyCommentBelongToThread('comment-123', 'thread-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should throw NotFoundError when comment not belong to thread', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ thread_id: 'thread-123' }], rowCount: 1
        });

        await expect(commentRepo.verifyCommentBelongToThread('comment-123', 'thread-456'))
          .rejects.toThrow(NotFoundError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(commentRepo.verifyCommentBelongToThread('', ''))
          .rejects.toThrow('Database fails');
      });
    });

    describe('verifyDeleteComment', () => {
      it('should correctly resolve and not throw error', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ thread_id: 'thread-123', owner_id: 'user-123' }],
          rowCount: 1,
        });

        await expect(commentRepo.verifyDeleteComment('comment-123', 'thread-123', 'user-123'))
          .resolves.not.toThrow();

        assertQueryCalled(
          mockPool.query, 'SELECT thread_id, owner_id FROM comments', ['comment-123']
        );
      });

      it('should throw NotFoundError when comment not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(commentRepo.verifyDeleteComment('comment-123', 'thread-123', 'user-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should throw NotFoundError when comment not belong to thread', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ thread_id: 'thread-123', owner_id: 'user-123' }],
          rowCount: 1
        });

        await expect(commentRepo.verifyDeleteComment('comment-123', 'thread-456', 'user-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should throw AuthorizationError when user is not the owner', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ thread_id: 'thread-123', owner_id: 'user-123' }],
          rowCount: 1,
        });

        await expect(commentRepo.verifyDeleteComment('comment-123', 'thread-123', 'user-456'))
          .rejects.toThrow(AuthorizationError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(commentRepo.verifyDeleteComment('', '', ''))
          .rejects.toThrow('Database fails');
      });
    });
  });
});