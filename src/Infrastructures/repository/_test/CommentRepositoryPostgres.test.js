const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('[Unit] CommentRepositoryPostgres', () => {
  it('must be an instance of CommentRepository', () => {
    const repo = new CommentRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(CommentRepository);
  });

  describe('Methods and Pool Query', () => {
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

    it('should throw error when database fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database fails'));

      await expect(commentRepo.addComment({}))
        .rejects.toThrow('Database fails');
      await expect(commentRepo.getCommentsByThreadId(''))
        .rejects.toThrow('Database fails');
      await expect(commentRepo.softDeleteCommentById(''))
        .rejects.toThrow('Database fails');
      await expect(commentRepo.verifyCommentExists(''))
        .rejects.toThrow('Database fails');
      await expect(commentRepo.verifyCommentOwner('', ''))
        .rejects.toThrow('Database fails');
    });

    describe('addComment', () => {
      it('should persist the comment and return the added comment correctly', async () => {
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
    });

    describe('getCommentsByThreadId', () => {
      it('should correctly pool.query and return the comments related to the given thread id', async () => {
        const comment1 = {
          id: 'comment-001',
          content: 'Isi komentar 1',
          username: 'whoami',
          created_at: new Date('2025-10-15T02:06:54.384Z'),
          is_delete: false,
        };
        const comment2 = {
          id: 'comment-002',
          content: 'Isi komentar 2',
          username: 'johndoe',
          created_at: new Date('2025-10-15T02:07:54.384Z'),
          is_delete: false,
        };
        const comment3 = {
          id: 'comment-003',
          content: 'Isi komentar 3',
          username: 'instinct',
          created_at: new Date('2025-10-15T02:08:54.384Z'),
          is_delete: false,
        };

        mockPool.query.mockResolvedValue({
          rows: [comment1, comment2, comment3],
          rowCount: 3,
        });

        const comments = await commentRepo.getCommentsByThreadId('thread-123');

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT'),
            values: ['thread-123'],
          })
        );
        expect(comments).toHaveLength(3);
        expect(comments[0]).toEqual(new Comment({
          id: comment1.id,
          content: comment1.content,
          username: comment1.username,
          date: comment1.created_at,
          isDelete: comment1.is_delete
        }));
        expect(comments[1]).toEqual(new Comment({
          id: comment2.id,
          content: comment2.content,
          username: comment2.username,
          date: comment2.created_at,
          isDelete: comment2.is_delete
        }));
        expect(comments[2]).toEqual(new Comment({
          id: comment3.id,
          content: comment3.content,
          username: comment3.username,
          date: comment3.created_at,
          isDelete: comment3.is_delete
        }));
      });
    });

    describe('softDeleteCommentById', () => {
      it('should throw NotFoundError when the given id is not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(commentRepo.softDeleteCommentById('comment-123'))
          .rejects.toThrow(NotFoundError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('is_delete = TRUE'),
            values: ['comment-123']
          })
        );
      });

      it('should not throw NotFoundError when the given id is exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-123' }],
          rowCount: 1
        });

        await expect(commentRepo.softDeleteCommentById('comment-123'))
          .resolves.not.toThrow(NotFoundError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('is_delete = TRUE'),
            values: ['comment-123']
          })
        );
      });
    });

    describe('verifyCommentExists', () => {
      it('should throw NotFoundError when the id is not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(commentRepo.verifyCommentExists('comment-123'))
          .rejects.toThrow(NotFoundError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith({
          text: expect.stringContaining('SELECT id FROM'),
          values: ['comment-123'],
        });
      });

      it('should not throw NotFoundError when the id is exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-123' }],
          rowCount: 1,
        });

        await expect(commentRepo.verifyCommentExists('comment-123'))
          .resolves.not.toThrow(NotFoundError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith({
          text: expect.stringContaining('SELECT id FROM'),
          values: ['comment-123'],
        });
      });
    });

    describe('verifyCommentOwner', () => {
      it('should throw NotFoundError when the comment id is not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(commentRepo.verifyCommentOwner('comment-123', 'user-123'))
          .rejects.toThrow(NotFoundError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT'),
            values: ['comment-123'],
          })
        );
      });

      it('should throw AuthorizationError when the given owner is not match', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ owner_id: 'user-123' }],
          rowCount: 1
        });

        await expect(commentRepo.verifyCommentOwner('comment-123', 'user-456'))
          .rejects.toThrow(AuthorizationError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT'),
            values: ['comment-123'],
          })
        );
      });

      it('should not throw error when the id and owner is match', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ owner_id: 'user-123' }],
          rowCount: 1
        });

        await expect(commentRepo.verifyCommentOwner('comment-123', 'user-123'))
          .resolves.not.toThrow();

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT'),
            values: ['comment-123'],
          })
        );
      });
    });
  });
});