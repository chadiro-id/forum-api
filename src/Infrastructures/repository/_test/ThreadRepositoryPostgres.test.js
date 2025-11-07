const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const { assertQueryCalled, assertDBError } = require('../../../../tests/helper/assertionsHelper');
const { createRawThread } = require('../../../../tests/util');

describe('[Mock-Based Integration] ThreadRepositoryPostgres', () => {
  it('must be an instance of ThreadRepository', () => {
    const threadRepo = new ThreadRepositoryPostgres({}, () => '');
    expect(threadRepo).toBeInstanceOf(ThreadRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let threadRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      threadRepo = new ThreadRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addThread', () => {
      it('should correctly resolves and call pool.query', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'thread-123', title: 'Sebuah thread', owner_id: 'user-123' }],
          rowCount: 1,
        });

        const addedThread = await threadRepo.addThread(new NewThread({
          title: 'Sebuah thread',
          body: 'Isi thread',
          owner: 'user-123',
        }));

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('INSERT INTO threads'),
          })
        );

        const calledValues = mockPool.query.mock.calls[0][0].values;
        expect(calledValues[0]).toEqual('thread-123');
        expect(calledValues[1]).toEqual('Sebuah thread');
        expect(calledValues[2]).toEqual('Isi thread');
        expect(calledValues[3]).toEqual('user-123');

        expect(addedThread).toBeInstanceOf(AddedThread);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        const promise = threadRepo.addThread({});
        await assertDBError(promise);
      });
    });

    describe('getThreadById', () => {
      it('should correctly resolves and call pool.query', async () => {
        const rawThread = createRawThread();

        mockPool.query.mockResolvedValue({
          rows: [rawThread],
          rowCount: 1,
        });

        const thread = await threadRepo.getThreadById('thread-123');

        assertQueryCalled(mockPool.query, 'SELECT', ['thread-123']);

        expect(thread).toBeInstanceOf(DetailThread);
      });

      it('should return null when thread not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const thread = await threadRepo.getThreadById('thread-123');
        expect(thread).toBeNull();
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        const promise = threadRepo.getThreadById('id');
        await assertDBError(promise);
      });
    });

    describe('isThreadExist', () => {
      it('should return true when thread exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'thread-123' }],
          rowCount: 1,
        });

        const result = await threadRepo.isThreadExist('thread-123');
        expect(result).toBe(true);

        assertQueryCalled(mockPool.query, 'SELECT id FROM threads', ['thread-123']);
      });

      it('should return false when thread not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const result = await threadRepo.isThreadExist('thread-123');
        expect(result).toBe(false);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        const promise = threadRepo.isThreadExist('thread-id');
        await assertDBError(promise);
      });
    });
  });
});