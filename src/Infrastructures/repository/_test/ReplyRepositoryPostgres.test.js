const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const Reply = require('../../../Domains/replies/entities/Reply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const { assertQueryCalled } = require('../../../../tests/helper/assertionsHelper');

describe('[Mock-Based Integration] ReplyRepositoryPostgres', () => {
  it('must be an instance of ReplyRepository', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, () => '');
    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let replyRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      replyRepo = new ReplyRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addReply', () => {
      it('should correctly persist the NewReply and return AddedReply', async () => {
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
        expect(addedReply.id).toEqual('reply-123');
        expect(addedReply.content).toEqual('Sebuah balasan');
        expect(addedReply.owner).toEqual('user-123');
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(replyRepo.addReply({}))
          .rejects.toThrow('Database fails');
      });
    });

    describe('getRepliesByCommentIds', () => {
      it('should correctly pool.query and return the array of reply', async () => {
        const reply1 = {
          id: 'reply-101',
          comment_id: 'comment-101',
          content: 'Isi balasan 1',
          created_at: new Date(2025, 10, 14, 10),
          is_delete: false,
          username: 'whoami',
        };
        const reply2 = {
          id: 'reply-102',
          comment_id: 'comment-101',
          content: 'Isi balasan 2',
          created_at: new Date(2025, 10, 14, 11),
          is_delete: false,
          username: 'johndoe',
        };
        const reply3 = {
          id: 'reply-103',
          comment_id: 'comment-102',
          content: 'Isi balasan 3',
          created_at: new Date(2025, 10, 14, 12),
          is_delete: false,
          username: 'whoami',
        };

        mockPool.query.mockResolvedValue({
          rows: [reply1, reply2, reply3],
          rowCount: 3,
        });

        const replies = await replyRepo.getRepliesByCommentIds(['comment-101', 'comment-102']);

        assertQueryCalled(
          mockPool.query, 'SELECT', [['comment-101', 'comment-102']]
        );

        expect(replies).toBeInstanceOf(Array);
        expect(replies).toHaveLength(3);
        expect(replies[0]).toEqual(new Reply({
          id: reply1.id,
          commentId: reply1.comment_id,
          content: reply1.content,
          date: reply1.created_at,
          username: reply1.username,
          isDelete: reply1.is_delete,
        }));
        expect(replies[1]).toEqual(new Reply({
          id: reply2.id,
          commentId: reply2.comment_id,
          content: reply2.content,
          date: reply2.created_at,
          username: reply2.username,
          isDelete: reply2.is_delete,
        }));
        expect(replies[2]).toEqual(new Reply({
          id: reply3.id,
          commentId: reply3.comment_id,
          content: reply3.content,
          date: reply3.created_at,
          username: reply3.username,
          isDelete: reply3.is_delete,
        }));
      });

      it('should return an empty array when no reply found', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const replies = await replyRepo.getRepliesByCommentIds(['comment-101', 'comment-102']);
        expect(replies).toEqual([]);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(replyRepo.getRepliesByCommentIds({}))
          .rejects.toThrow('Database fails');
      });
    });

    describe('softDeleteReplyById', () => {
      it('should correctly resolve and not thrown error', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'reply-123' }],
          rowCount: 1
        });

        await expect(replyRepo.softDeleteReplyById('reply-123'))
          .resolves.not.toThrow(NotFoundError);

        assertQueryCalled(
          mockPool.query, 'UPDATE replies SET is_delete = TRUE', ['reply-123']
        );
      });

      it('should throw NotFoundError when id not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(replyRepo.softDeleteReplyById('reply-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(replyRepo.softDeleteReplyById({}))
          .rejects.toThrow('Database fails');
      });
    });

    describe('verifyDeleteReply', () => {
      it('should correctly resolve and not throw error', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ comment_id: 'comment-123', owner_id: 'user-123' }],
          rowCount: 1,
        });

        await expect(replyRepo.verifyDeleteReply('reply-123', 'comment-123', 'user-123'))
          .resolves.not.toThrow();

        assertQueryCalled(
          mockPool.query, 'SELECT comment_id, owner_id FROM replies', ['reply-123']
        );
      });

      it('should throw NotFoundError when reply not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(replyRepo.verifyDeleteReply('reply-123', 'comment-123', 'user-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should throw NotFoundError when reply not belong to comment', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ comment_id: 'comment-123', owner_id: 'user-123' }],
          rowCount: 1,
        });

        await expect(replyRepo.verifyDeleteReply('reply-123', 'other-thread-id', 'user-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should throw AuthorizationError when user is not the owner', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ comment_id: 'comment-123', owner_id: 'user-123' }],
          rowCount: 1
        });

        await expect(replyRepo.verifyDeleteReply('reply-123', 'comment-123', 'other-user-id'))
          .rejects.toThrow(AuthorizationError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(replyRepo.verifyDeleteReply('reply-123', 'comment-123', 'user-123'))
          .rejects.toThrow('Database fails');
      });
    });
  });
});