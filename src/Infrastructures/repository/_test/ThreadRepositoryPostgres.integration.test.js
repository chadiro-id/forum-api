const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const pgTest = require('../../../../tests/helper/postgres');
const { assertDBError } = require('../../../../tests/helper/assertionsHelper');
require('../../../../tests/matcher/dateMatcher');

beforeAll(async () => {
  await pgTest.truncate();
});

afterAll(async () => {
  await pgTest.end();
});

describe('[Integration] ThreadRepositoryPostgres', () => {
  let threadRepo;
  let user;

  beforeAll(async () => {
    threadRepo = new ThreadRepositoryPostgres(pgTest.getPool(), () => '123');
    user = await pgTest.users.add({});
  });

  afterEach(async () => {
    await pgTest.threads.clean();
  });

  afterAll(async () => {
    await pgTest.users.clean();
  });

  describe('addThread', () => {
    it('should correctly persist the NewThread and return AddedThread', async () => {
      const newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        userId: user.id,
      });

      const addedThread = await threadRepo.addThread(newThread);
      const threads = await pgTest.threads.findById('thread-123');

      expect(threads).toStrictEqual([
        {
          id: 'thread-123',
          title: newThread.title,
          body: newThread.body,
          owner_id: newThread.userId,
          created_at: expect.toBeRecentDate(),
        },
      ]);

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: newThread.title,
        owner: newThread.userId,
      }));
    });

    it('should propagate error when id violate constraint', async () => {
      await pgTest.threads.add({ id: 'thread-123', owner_id: user.id });
      const newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        userId: user.id,
      });

      const promise = threadRepo.addThread(newThread);
      await assertDBError(promise);
    });

    it('should propagate error when owner violate constraint', async () => {
      const newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        userId: 'nonexistent-user-id',
      });

      const promise = threadRepo.addThread(newThread);
      await assertDBError(promise);
    });
  });

  describe('getThreadById', () => {
    it('should resolves and return the ThreadDetails', async () => {
      const insertedThread = await pgTest.threads.add({ owner_id: user.id });

      const thread = await threadRepo.getThreadById('thread-001');
      expect(thread).toStrictEqual(new ThreadDetails({
        id: insertedThread.id,
        title: insertedThread.title,
        body: insertedThread.body,
        date: insertedThread.created_at,
        username: user.username,
      }));
    });

    it('should return null when thread not exist', async () => {
      const thread = await threadRepo.getThreadById('nonexistent-thread-id');
      expect(thread).toBeNull();
    });
  });

  describe('isThreadExist', () => {
    it('should return true when thread exist', async () => {
      await pgTest.threads.add({ owner_id: user.id });

      const result = await threadRepo.isThreadExist('thread-001');
      expect(result).toBe(true);
    });

    it('should return false when thread not exist', async () => {
      const result = await threadRepo.isThreadExist('thread-001');
      expect(result).toBe(false);
    });
  });
});