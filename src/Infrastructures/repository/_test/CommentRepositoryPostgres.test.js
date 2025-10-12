const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  describe('CommentRepository contract enforcement', () => {
    it('must be an instance of CommentRepository', () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres({}, () => '');

      expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
    });
  });

  describe('Method implementations', () => {
    let mockPool;
    let fakeIdGenerator;
    let commentRepositoryPostgres;

    const dummyNewComment = {
      threadId: 'thread-123',
      ownerId: 'user-456',
      content: 'Sebuah komentar',
    };

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

    describe('addComment', () => {
      it('should persist the comment and return the added comment', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'comment-123', content: 'Sebuah komentar', owner_id: 'user-456' }],
          rowCount: 1,
        });

        const addedComment = await commentRepositoryPostgres.addComment(dummyNewComment);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('INSERT INTO comments'),
          })
        );
        const calledValues = mockPool.query.mock.calls[0][0].values;
        expect(calledValues[0]).toEqual('comment-123');
        expect(calledValues[1]).toEqual(dummyNewComment.content);
        expect(calledValues[2]).toEqual(dummyNewComment.threadId);
        expect(calledValues[3]).toEqual(dummyNewComment.ownerId);

        expect(addedComment).toEqual({
          id: 'comment-123',
          content: 'Sebuah komentar',
          owner: 'user-456',
        });
      });
    });
  });
});