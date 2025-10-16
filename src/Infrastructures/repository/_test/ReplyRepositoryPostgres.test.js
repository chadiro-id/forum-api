const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');
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
  });
});