const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  describe('CommentRepository contract enforcement', () => {
    it('must be an instance of CommentRepository', () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres({}, () => '');

      expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
    });
  });

  describe('Method implementations and database query', () => {
    let mockPool;
    let fakeIdGenerator;
    let commentRepositoryPostgres;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      fakeIdGenerator = () => '123';

      commentRepositoryPostgres = new CommentRepositoryPostgres(mockPool, fakeIdGenerator);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should throw error when database fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database fails'));

      await expect(commentRepositoryPostgres.addComment({}))
        .rejects.toThrow('Database fails');
      await expect(commentRepositoryPostgres.getCommentsByThreadId(''))
        .rejects.toThrow('Database fails');
      await expect(commentRepositoryPostgres.softDeleteCommentById(''))
        .rejects.toThrow('Database fails');
      await expect(commentRepositoryPostgres.verifyCommentExists(''))
        .rejects.toThrow('Database fails');
      await expect(commentRepositoryPostgres.verifyCommentOwner('', ''))
        .rejects.toThrow('Database fails');
    });

    describe('addComment', () => {
      it('should persist the comment record and return the id correctly', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-123' }],
          rowCount: 1,
        });

        const addedCommentId = await commentRepositoryPostgres.addComment({
          thread_id: 'thread-123',
          owner_id: 'user-123',
          content: 'Something comment',
        });

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
        expect(calledValues[3]).toEqual('Something comment');

        expect(addedCommentId).toEqual('comment-123');
      });
    });

    describe('getCommentsByThreadId', () => {
      it('should correctly query the database and return the comments related to the given thread id', async () => {
        mockPool.query.mockResolvedValue({
          rows: [
            {
              id: 'comment-001',
              content: 'Something comment',
              username: 'forumapi_1',
              created_at: 'date time',
              is_delete: false,
            },
            {
              id: 'comment-002',
              content: 'Something comment',
              username: 'forumapi_2',
              created_at: 'date time',
              is_delete: false,
            },
            {
              id: 'comment-003',
              content: 'Something comment',
              username: 'forumapi_3',
              created_at: 'date time',
              is_delete: false,
            },
          ],
          rowCount: 3,
        });

        const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT'),
            values: ['thread-123'],
          })
        );
        expect(comments).toHaveLength(3);
        expect(comments).toEqual(
          expect.arrayOf({
            id: expect.stringContaining('comment-'),
            content: expect.stringContaining('Something'),
            username: expect.stringContaining('forumapi_'),
            is_delete: expect.any(Boolean),
            created_at: expect.stringContaining('date'),
          })
        );
      });
    });
  });
});