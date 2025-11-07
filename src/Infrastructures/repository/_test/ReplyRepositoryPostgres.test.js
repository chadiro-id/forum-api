const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const { createRawReply } = require('../../../../tests/util');
const {
  assertQueryCalled,
  assertDBError,
  expectReplyFromRepository,
} = require('../../../../tests/helper/assertionsHelper');

describe('[Mock-Based Integration] ReplyRepositoryPostgres', () => {
  it('must be an instance of ReplyRepository', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, () => '');
    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let dbError;
    let replyRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      dbError = new Error('Database fails');
      replyRepo = new ReplyRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addReply', () => {
      it('should correctly call pool.query', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'reply-123', content: 'Sebuah balasan', owner_id: 'user-123' }],
          rowCount: 1,
        });

        const addedReply = await replyRepo.addReply(new NewReply({
          commentId: 'comment-123',
          content: 'Sebuah balasan',
          owner: 'user-123',
        }));

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('INSERT INTO')
          })
        );
        const calledValues = mockPool.query.mock.calls[0][0].values;
        expect(calledValues[0]).toEqual('reply-123');
        expect(calledValues[1]).toEqual('comment-123');
        expect(calledValues[2]).toEqual('user-123');
        expect(calledValues[3]).toEqual('Sebuah balasan');

        expect(addedReply).toBeInstanceOf(AddedReply);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.addReply({});
        await assertDBError(promise);
      });
    });

    describe('getRepliesByCommentIds', () => {
      it('should correctly call pool.query', async () => {
        const reply1 = createRawReply({ id: 'reply-101', comment_id: 'comment-101', username: 'whoami' });
        const reply2 = createRawReply({ id: 'reply-102', comment_id: 'comment-101', is_delete: true });
        const reply3 = createRawReply({ id: 'reply-103', comment_id: 'comment-102', username: 'whoami' });

        mockPool.query.mockResolvedValue({
          rows: [reply1, reply2, reply3],
          rowCount: 3,
        });

        const replies = await replyRepo.getRepliesByCommentIds(['comment-101', 'comment-102']);

        assertQueryCalled(
          mockPool.query, 'SELECT', [['comment-101', 'comment-102']]
        );

        expect(replies).toHaveLength(3);
        expectReplyFromRepository(replies[0], { ...reply1 });
        expectReplyFromRepository(replies[1], { ...reply2 });
        expectReplyFromRepository(replies[2], { ...reply3 });
      });

      it('should return an empty array when no reply found', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const replies = await replyRepo.getRepliesByCommentIds(['comment-101', 'comment-102']);
        expect(replies).toEqual([]);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.getRepliesByCommentIds([]);
        await assertDBError(promise);
      });
    });

    describe('getReplyForDeletion', () => {
      it('should correctly call pool.query', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ owner_id: 'user-001' }],
          rowCount: 1,
        });

        await replyRepo.getReplyForDeletion('reply-001', 'comment-001', 'thread-001');
        const query = {
          text: 'SELECT',
          values: ['reply-001', 'comment-001', 'thread-001'],
        };

        assertQueryCalled(mockPool.query, query.text, query.values);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.getReplyForDeletion('reply-id', 'comment-id', 'thread-id');
        await assertDBError(promise);
      });
    });

    describe('softDeleteReplyById', () => {
      it('should correctly call pool.query', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'reply-123' }],
          rowCount: 1
        });

        await expect(replyRepo.softDeleteReplyById('reply-123'))
          .resolves.not.toThrow();

        assertQueryCalled(
          mockPool.query, 'UPDATE replies SET is_delete = TRUE', ['reply-123']
        );
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = replyRepo.softDeleteReplyById('id');
        await assertDBError(promise);
      });
    });
  });
});