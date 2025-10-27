const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const pgTest = require('../../../../tests/helper/postgres');

describe('[Integration] ThreadRepositoryPostgres', () => {
  let threadRepo;

  beforeAll(async () => {
    threadRepo = new ThreadRepositoryPostgres(pool, () => '123');
  });

  beforeEach(async () => {
    await pgTest.truncate();
  });

  afterAll(async () => {
    await pgTest.truncate();
    await pool.end();
  });

  describe('addThread', () => {
    it('should correctly persist the NewThread and return AddedThread', async () => {
      const user = await pgTest.users().add({});
      const newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        owner: user.id,
      });

      const addedThread = await threadRepo.addThread(newThread);

      const thread = await pgTest.threads().findById('thread-123');
      expect(thread).toHaveLength(1);

      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread).toEqual(expect.objectContaining({
        id: expect.stringContaining('thread-'),
        title: 'Sebuah thread',
      }));
    });

    it('should propagate error when id is exists', async () => {
      const user = await pgTest.users().add({});
      await pgTest.threads().add({ id: 'thread-123', owner_id: user.id });
      const newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        owner: user.id,
      });

      await expect(threadRepo.addThread(newThread))
        .rejects.toThrow();
    });

    it('should propagate error when owner not exists', async () => {
      const newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        owner: 'nonexistent-user-id',
      });

      await expect(threadRepo.addThread(newThread))
        .rejects.toThrow();
    });
  });

  describe('getThreadById', () => {
    it('should correctly resolve and return the DetailThread', async () => {
      const user = await pgTest.users().add({});
      const { created_at: date } = await pgTest.threads().add({ owner_id: user.id });

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
      const user = await pgTest.users().add({});
      await pgTest.threads().add({ owner_id: user.id });

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