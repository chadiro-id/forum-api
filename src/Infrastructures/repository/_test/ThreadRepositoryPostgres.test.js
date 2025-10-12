const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
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
      it('should throw error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database connection failed'));

        await expect(
          threadRepositoryPostgres.addThread({})
        ).rejects.toThrow('Database connection failed');
      });

      it('should persist the thread record and return the id correctly', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'thread-123' }],
          rowCount: 1,
        });

        const addedThreadId = await threadRepositoryPostgres.addThread({
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

        expect(addedThreadId).toEqual('thread-123');
      });
    });

    describe('verifyThreadExists', () => {
      it('should throw error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database connection failed'));

        await expect(
          threadRepositoryPostgres.verifyThreadExists('')
        ).rejects.toThrow('Database connection failed');
      });

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
            values: expect.arrayContaining(['thread-123']),
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
            values: expect.arrayContaining(['thread-123']),
          })
        );
      });
    });

    describe('getThreadById', () => {
      it('should throw error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database connection failed'));

        await expect(
          threadRepositoryPostgres.getThreadById('thread-123')
        ).rejects.toThrow('Database connection failed');
      });

      it('should throw NotFoundError when the thread record with the given id is not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(
          threadRepositoryPostgres.getThreadById('thread-123')
        ).rejects.toThrow(NotFoundError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT'),
            values: ['thread-123'],
          })
        );
      });

      it('should correctly query and return the thread record with the given id if exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{
            id: 'thread-123',
            title: 'Some thread title',
            body: 'Some thread content',
            username: 'forumapi',
            created_at: 'xxx'
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

        expect(thread).toEqual({
          id: 'thread-123',
          title: 'Some thread title',
          body: 'Some thread content',
          created_at: 'xxx',
          username: 'forumapi',
        });
      });
    });
  });
});