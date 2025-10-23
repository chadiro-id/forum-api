const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const { usersTable, threadsTable } = require('../../../../tests/helper/postgres');

describe('[Integration] ThreadRepositoryPostgres', () => {
  let threadRepo;
  let user;

  beforeAll(async () => {
    threadRepo = new ThreadRepositoryPostgres(pool, () => '123');
    user = await usersTable.add({});
  });

  beforeEach(async () => {
    await threadsTable.clean();
  });

  afterAll(async () => {
    await usersTable.clean();
    await threadsTable.clean();
    await pool.end();
  });

  describe('addThread', () => {
    let newThread;

    beforeAll(() => {
      newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        owner: user.id,
      });
    });

    it('should persist the new thread entity correctly', async () => {
      await threadRepo.addThread(newThread);

      const thread = await threadsTable.findById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return the added thread entity correctly', async () => {
      const addedThread = await threadRepo.addThread(newThread);
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Sebuah thread',
        owner: user.id,
      }));
    });
  });

  describe('getThreadById', () => {
    it('should correctly resolve and return the DetailThread', async () => {
      const { created_at: date } = await threadsTable.add({ owner_id: user.id });

      const thread = await threadRepo.getThreadById('thread-001');

      expect(thread).toStrictEqual(new DetailThread({
        id: 'thread-001',
        title: 'Sebuah thread',
        body: 'Isi thread',
        date,
        username: user.username,
      }));
    });

    it('should throw NotFoundError when id not exists', async () => {
      await expect(threadRepo.getThreadById('nonexistent-thread-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('verifyThreadExists', () => {
    it('should correctly resolve and not throw error', async () => {
      await threadsTable.add({ owner_id: user.id });

      await expect(threadRepo.verifyThreadExists('thread-001'))
        .resolves
        .not.toThrow();
    });

    it('should throw NotFoundError when id not exists', async () => {
      await expect(threadRepo.verifyThreadExists('nonexistent-thread-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});