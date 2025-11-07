const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const { createRawComment } = require('../../../../tests/util');
const {
  assertQueryCalled,
  assertDBError,
  expectCommentFromRepository,
}= require('../../../../tests/helper/assertionsHelper');

describe('[Mock-Based Integration] CommentRepositoryPostgres', () => {
  it('must be an instance of CommentRepository', () => {
    const repo = new CommentRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(CommentRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let dbError;
    let commentRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      dbError = new Error('Database fails');
      commentRepo = new CommentRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addComment', () => {
      it('should correctly resolves and call pool.query', async () => {
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

        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: 'Sebuah komentar',
          owner: 'user-123',
        }));
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = commentRepo.addComment({});
        await assertDBError(promise);
      });
    });

    describe('getCommentsByThreadId', () => {
      it('should correctly call pool.query and return comments', async () => {
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
        mockPool.query.mockRejectedValue(dbError);

        const promise = commentRepo.getCommentsByThreadId('comment-id');
        await assertDBError(promise);
      });
    });

    describe('getCommentForDeletion', () => {
      it('should correctly call pool.query and return comment object', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ owner_id: 'user-123' }],
          rowCount: 1,
        });

        const comment = await commentRepo.getCommentForDeletion('comment-001', 'thread-001');
        expect(comment).toStrictEqual({ owner: 'user-123' });

        assertQueryCalled(
          mockPool.query, 'SELECT owner_id FROM comments', ['comment-001', 'thread-001']
        );
      });

      it('should return null when comment not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const comment = await commentRepo.getCommentForDeletion('comment-001', 'thread-001');
        expect(comment).toBeNull();
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = commentRepo.getCommentForDeletion('comment-001', 'thread-001');
        await assertDBError(promise);
      });
    });

    describe('softDeleteCommentById', () => {
      it('should correctly resolve and call pool.query', async () => {
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

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = commentRepo.softDeleteCommentById('comment-id');
        await assertDBError(promise);
      });
    });

    describe('isCommentExist', () => {
      it('should return true when comment exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-001' }], rowCount: 1
        });

        const isExist = await commentRepo.isCommentExist('comment-001', 'thread-001');
        expect(isExist).toBe(true);

        assertQueryCalled(mockPool.query, 'SELECT', ['comment-001', 'thread-001']);
      });

      it('should return false when comment not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const isExist = await commentRepo.isCommentExist('comment-001', 'thread-001');
        expect(isExist).toBe(false);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = commentRepo.isCommentExist('comment-id', 'thread-id');
        await assertDBError(promise);
      });
    });
  });
});