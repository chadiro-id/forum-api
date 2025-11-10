const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const CommentOwner = require('../../../Domains/comments/entities/CommentOwner');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const { createRawComment } = require('../../../../tests/util');
const { assertQueryCalled, assertDBError } = require('../../../../tests/helper/assertionsHelper');
require('../../../../tests/matcher/queryMatcher');

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
      it('should resolves and call pool.query correctly', async () => {
        const expectedQueryText =
          `
          INSERT INTO comments
            (id, thread_id, owner_id, content, created_at)
          VALUES
            ($1, $2, $3, $4, $5)
          RETURNING
            id, content, owner_id
          `;
        const expectedQueryValues = [
          'comment-123', 'thread-123', 'user-123', 'Sebuah komentar', new Date()
        ];
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-123', content: 'Sebuah komentar', owner_id: 'user-123' }],
          rowCount: 1,
        });

        const addedComment = await commentRepo.addComment(new NewComment({
          threadId: 'thread-123',
          content: 'Sebuah komentar',
          userId: 'user-123',
        }));

        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: 'Sebuah komentar',
          owner: 'user-123',
        }));

        assertQueryCalled(mockPool.query, expectedQueryText, expectedQueryValues);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = commentRepo.addComment({});
        await assertDBError(promise);
      });
    });

    describe('getCommentsByThreadId', () => {
      it('should return comments and call pool.query correctly', async () => {
        const expectedQueryText =
          `
          SELECT
            c.id, c.content, c.created_at, c.is_delete, u.username
          FROM
            comments c
          LEFT JOIN
            users u
          ON
            u.id = c.owner_id
          WHERE
            c.thread_id = $1
          ORDER BY
            c.created_at ASC
          `;
        const comment1 = createRawComment({ id: 'comment-001' });
        const comment2 = createRawComment({ id: 'comment-002', username: 'dicoder', is_delete: true });

        mockPool.query.mockResolvedValue({
          rows: [comment1, comment2],
          rowCount: 3,
        });

        const comments = await commentRepo.getCommentsByThreadId('thread-123');
        expect(comments).toStrictEqual([
          new Comment({
            id: comment1.id,
            content: comment1.content,
            username: comment1.username,
            date: comment1.created_at,
            isDelete: comment1.is_delete,
          }),
          new Comment({
            id: comment2.id,
            content: comment2.content,
            username: comment2.username,
            date: comment2.created_at,
            isDelete: comment2.is_delete,
          }),
        ]);

        assertQueryCalled(mockPool.query, expectedQueryText, ['thread-123']);
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
      it('should resolves and call pool.query correctly', async () => {
        const expectedQueryText =
          'SELECT owner_id FROM comments WHERE id = $1 AND thread_id = $2';
        mockPool.query.mockResolvedValue({
          rows: [{ owner_id: 'user-123' }],
          rowCount: 1,
        });

        const comment = await commentRepo.getCommentForDeletion('comment-001', 'thread-001');
        expect(comment).toStrictEqual(new CommentOwner({ owner: 'user-123' }));

        assertQueryCalled(mockPool.query, expectedQueryText, ['comment-001', 'thread-001']);
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
      it('should resolves and call pool.query correctly', async () => {
        const expectedQueryText = 'UPDATE comments SET is_delete = TRUE WHERE id = $1';
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-123' }],
          rowCount: 1
        });

        await expect(commentRepo.softDeleteCommentById('comment-123'))
          .resolves.not.toThrow();

        assertQueryCalled(mockPool.query, expectedQueryText, ['comment-123']);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = commentRepo.softDeleteCommentById('comment-id');
        await assertDBError(promise);
      });
    });

    describe('isCommentExist', () => {
      it('should return true when comment exist', async () => {
        const expectedQueryText =
          'SELECT id FROM comments WHERE id = $1 AND thread_id = $2';
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-001' }], rowCount: 1
        });

        const isExist = await commentRepo.isCommentExist('comment-001', 'thread-001');
        expect(isExist).toBe(true);

        assertQueryCalled(mockPool.query, expectedQueryText, ['comment-001', 'thread-001']);
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