const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const { assertQueryCalled } = require('../../../../tests/helper/assertionsHelper');

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
      it('should correctly persist the NewThread and return AddedThread', async () => {
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
        expect(addedThread.id).toEqual('thread-123');
        expect(addedThread.title).toEqual('Sebuah thread');
        expect(addedThread.owner).toEqual('user-123');
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(threadRepo.addThread({}))
          .rejects.toThrow();
      });
    });

    describe('getThreadById', () => {
      it('should correctly pool.query and return DetailThread', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{
            id: 'thread-123',
            title: 'Sebuah thread',
            body: 'Isi thread',
            username: 'johndoe',
            created_at: new Date('2025-10-12T14:59:05.169Z')
          }],
          rowCount: 1,
        });

        const thread = await threadRepo.getThreadById('thread-123');

        assertQueryCalled(mockPool.query, 'SELECT', ['thread-123']);

        expect(thread).toBeInstanceOf(DetailThread);
        expect(thread).toEqual(expect.objectContaining({
          id: 'thread-123',
          title: 'Sebuah thread',
          body: 'Isi thread',
          date: new Date('2025-10-12T14:59:05.169Z'),
          username: 'johndoe',
          comments: [],
        }));
      });

      it('should throw NotFoundError when id not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(threadRepo.getThreadById('thread-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(threadRepo.getThreadById({}))
          .rejects.toThrow();
      });
    });

    describe('verifyThreadExists', () => {
      it('should correctly resolve and not throw error', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'thread-123' }],
          rowCount: 1,
        });

        await expect(threadRepo.verifyThreadExists('thread-123'))
          .resolves.not.toThrow();

        assertQueryCalled(mockPool.query, 'SELECT id FROM threads', ['thread-123']);
      });

      it('should throw NotFoundError when thread not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(threadRepo.verifyThreadExists('thread-123'))
          .rejects.toThrow(NotFoundError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(threadRepo.verifyThreadExists({}))
          .rejects.toThrow();
      });
    });
  });
});