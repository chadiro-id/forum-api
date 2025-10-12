const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  describe('ThreadRepository contract enforcement', () => {
    it('must be an instance of ThreadRepository', () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, () => '');

      expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
    });
  });

  describe('Method Implementations', () => {
    let mockPool;
    let fakeIdGenerator;
    let threadRepositoryPostgres;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      fakeIdGenerator = () => '123';

      threadRepositoryPostgres = new ThreadRepositoryPostgres(mockPool, fakeIdGenerator);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addThread', () => {
      it('should persist the record and return the added record correctly', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{
            id: 'thread-123',
            title: 'Some title',
            owner_id: 'user-123',
          }],
          rowCount: 1,
        });

        const addedRecord = await threadRepositoryPostgres.addThread({
          title: 'Some title',
          body: 'Some body',
          owner_id: 'user-123',
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('INSERT INTO threads'),
          })
        );

        const calledValues = mockPool.query.mock.calls[0][0].values;
        expect(calledValues[0]).toEqual('thread-123');
        expect(calledValues[1]).toEqual('Some title');
        expect(calledValues[2]).toEqual('Some body');
        expect(calledValues[3]).toEqual('user-123');

        expect(addedRecord).toEqual({
          id: 'thread-123',
          title: 'Some title',
          owner_id: 'user-123',
        });
      });
    });
  });
});