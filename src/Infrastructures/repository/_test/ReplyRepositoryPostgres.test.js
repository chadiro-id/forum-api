const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const Reply = require('../../../Domains/replies/entities/Reply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  describe('ReplyRepository Contract', () => {
    it('must be an instance of ReplyRepository', () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, () => '');

      expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
    });
  });

  describe('Methods and Pool Query', () => {
    let mockPool;
    let repo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };

      repo = new ReplyRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addReply', () => {
      it('should persist the new reply and return the added reply', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'reply-123', content: 'Sebuah balasan', owner_id: 'user-123' }],
          rowCount: 1,
        });

        const addedReply = await repo.addReply(new NewReply({
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
    });

    describe('getRepliesByCommentIds', () => {
      it('should correctly pool.query and return the replies related to the given ids', async () => {
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

        const replies = await repo.getRepliesByCommentIds(['comment-101', 'comment-102']);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT'),
            values: [['comment-101', 'comment-102']]
          })
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
    });
  });
});