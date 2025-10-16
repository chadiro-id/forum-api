const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  describe('ThreadRepository contract enforcement', () => {
    it('must be an instance of ThreadRepository', () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, () => '');

      expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
    });
  });

  describe('Method implementations and database query', () => {
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

    it('should throw error when database fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database fails'));

      await expect(threadRepositoryPostgres.addThread({}))
        .rejects.toThrow('Database fails');
      await expect(threadRepositoryPostgres.verifyThreadExists(''))
        .rejects.toThrow('Database fails');
      await expect(threadRepositoryPostgres.getThreadById(''))
        .rejects.toThrow('Database fails');
    });

    describe('addThread', () => {
      it('should persist the thread record and return the id correctly', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'thread-123', title: 'Judul thread', owner_id: 'user-123' }],
          rowCount: 1,
        });

        const addedThread = await threadRepositoryPostgres.addThread({
          title: 'Judul thread',
          body: 'Sebuah thread',
          owner: 'user-123',
        });

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('INSERT INTO threads'),
          })
        );

        const calledValues = mockPool.query.mock.calls[0][0].values;
        expect(calledValues[0]).toEqual('thread-123');
        expect(calledValues[1]).toEqual('Judul thread');
        expect(calledValues[2]).toEqual('Sebuah thread');
        expect(calledValues[3]).toEqual('user-123');

        expect(addedThread.id).toEqual('thread-123');
        expect(addedThread.title).toEqual('Judul thread');
        expect(addedThread.owner).toEqual('user-123');
      });
    });

    describe('verifyThreadExists', () => {
      it('should throw NotFoundError when the thread record with the given id is not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
          .rejects.toThrow(NotFoundError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT id FROM threads'),
            values: ['thread-123'],
          })
        );
      });

      it('should not throw error when the thread record with the given id is exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'thread-123' }],
          rowCount: 1,
        });

        await expect(threadRepositoryPostgres.verifyThreadExists('thread-123'))
          .resolves.not.toThrow();

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT id FROM threads'),
            values: ['thread-123'],
          })
        );
      });
    });

    describe('getThreadById', () => {
      it('should throw NotFoundError when the thread record with the given id is not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(() => threadRepositoryPostgres.getThreadById('thread-123'))
          .rejects.toThrow(NotFoundError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT'),
            values: ['thread-123'],
          })
        );
      });

      it('should correctly query the database and return the thread record related to the given id', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{
            id: 'thread-123',
            title: 'Judul thread',
            body: 'Sebuah thread',
            username: 'johndoe',
            created_at: '2025-10-12T14:59:05.169Z'
          }],
          rowCount: 1,
        });

        const thread = await threadRepositoryPostgres.getThreadById('thread-123');

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT'),
            values: ['thread-123']
          })
        );

        console.log(thread);

        expect(thread).toEqual(new DetailThread({
          id: 'thread-123',
          title: 'Judul thread',
          body: 'Sebuah thread',
          date: '2025-10-12T14:59:05.169Z',
          username: 'johndoe',
          comments: [],
        }));
      });
    });
  });
});