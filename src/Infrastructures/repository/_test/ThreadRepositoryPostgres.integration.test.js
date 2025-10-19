const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const { usersTable, threadsTable } = require('../../../../tests/helper/postgres');

describe('[Integration] ThreadRepositoryPostgres', () => {
  let threadRepo;
  let currentUser;

  beforeAll(async () => {
    threadRepo = new ThreadRepositoryPostgres(pool, () => '123');
    currentUser = await usersTable.add({ username: 'whoami' });
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
        owner: currentUser.id,
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
        owner: currentUser.id,
      }));
    });
  });

  describe('verifyThreadExists', () => {
    it('should throw NotFoundError when the id is not exists', async () => {
      await expect(threadRepo.verifyThreadExists('thread-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when the id is exists', async () => {
      await threadsTable.add({ owner: currentUser.id });

      await expect(threadRepo.verifyThreadExists('thread-123'))
        .resolves
        .not.toThrow(NotFoundError);
    });
  });

  describe('getThreadById', () => {
    it('should throw NotFoundError when the id is not exists', async () => {
      await expect(threadRepo.getThreadById('thread-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should return the DetailThread entity correctly', async () => {
      const { created_at: date } = await threadsTable.add({ owner: currentUser.id });

      const thread = await threadRepo.getThreadById('thread-123');

      expect(thread).toStrictEqual(new DetailThread({
        id: 'thread-123',
        title: 'Sebuah thread',
        body: 'Isi thread',
        date,
        username: 'whoami',
      }));
    });
  });
});