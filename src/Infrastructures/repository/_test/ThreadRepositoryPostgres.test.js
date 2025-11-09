const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const { assertQueryCalled, assertDBError } = require('../../../../tests/helper/assertionsHelper');
const { createRawThread } = require('../../../../tests/util');
require('../../../../tests/matcher/queryMatcher');

let fixedTime;
beforeAll(() => {
  fixedTime = new Date();
  jest.setSystemTime(fixedTime);
});

describe('[Mock-Based Integration] ThreadRepositoryPostgres', () => {
  it('must be an instance of ThreadRepository', () => {
    const threadRepo = new ThreadRepositoryPostgres({}, () => '');
    expect(threadRepo).toBeInstanceOf(ThreadRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let dbError;
    let threadRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      dbError = new Error('Database fails');
      threadRepo = new ThreadRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addThread', () => {
      it('should resolves and call pool.query correctly', async () => {
        const expectedQueryText =
          `
          INSERT INTO threads
            (id, title, body, owner_id, created_at)
          VALUES
            ($1, $2, $3, $4, $5)
          RETURNING
            id, title, owner_id
          `;
        const expectedQueryValues = [
          'thread-123', 'Sebuah thread', 'Isi thread', 'user-123', fixedTime
        ];

        mockPool.query.mockResolvedValue({
          rows: [{ id: 'thread-123', title: 'Sebuah thread', owner_id: 'user-123' }],
          rowCount: 1,
        });

        const addedThread = await threadRepo.addThread(new NewThread({
          title: 'Sebuah thread',
          body: 'Isi thread',
          userId: 'user-123',
        }));
        expect(addedThread).toBeInstanceOf(AddedThread);

        expect(mockPool.query).toHaveBeenCalledWith({
          text: expect.toMatchQueryText(expectedQueryText),
          values: expectedQueryValues,
        });
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = threadRepo.addThread({});
        await assertDBError(promise);
      });
    });

    describe('getThreadById', () => {
      it('should correctly resolves and call pool.query', async () => {
        const expectedQueryText =
          `
          SELECT
            t.id, t.title, t.body, t.created_at, u.username
          FROM
            threads t
          LEFT JOIN
            users u
          ON
            u.id = t.owner_id
          WHERE
            t.id = $1
          `;

        const rawThread = createRawThread();

        mockPool.query.mockResolvedValue({
          rows: [rawThread],
          rowCount: 1,
        });

        const thread = await threadRepo.getThreadById('thread-123');
        expect(thread).toBeInstanceOf(ThreadDetails);

        expect(mockPool.query).toHaveBeenCalledWith({
          text: expect.toMatchQueryText(expectedQueryText),
          values: ['thread-123'],
        });
      });

      it('should return null when thread not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const thread = await threadRepo.getThreadById('thread-123');
        expect(thread).toBeNull();
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = threadRepo.getThreadById('id');
        await assertDBError(promise);
      });
    });

    describe('isThreadExist', () => {
      it('should return true when thread exist', async () => {
        const calledQuery = {
          text: 'SELECT id FROM threads WHERE id = $1',
          values: ['thread-123'],
        };
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'thread-123' }],
          rowCount: 1,
        });

        const result = await threadRepo.isThreadExist('thread-123');
        expect(result).toBe(true);

        assertQueryCalled(mockPool.query, calledQuery);
      });

      it('should return false when thread not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const result = await threadRepo.isThreadExist('thread-123');
        expect(result).toBe(false);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = threadRepo.isThreadExist('thread-id');
        await assertDBError(promise);
      });
    });
  });
});