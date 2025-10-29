const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const pgTest = require('../../../../tests/helper/postgres');

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
        owner: user.id,
      });

      const addedThread = await threadRepo.addThread(newThread);

      const thread = await pgTest.threads.findById('thread-123');
      expect(thread).toHaveLength(1);

      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread.id).toEqual('thread-123');
    });

    it('should propagate error when id is exists', async () => {
      await pgTest.threads.add({ id: 'thread-123', owner_id: user.id });
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
      const insertedThread = await pgTest.threads.add({ owner_id: user.id });

      const thread = await threadRepo.getThreadById('thread-001');

      expect(thread).toBeInstanceOf(DetailThread);
      expect(thread).toEqual(expect.objectContaining({
        id: insertedThread.id,
        title: insertedThread.title,
        body: insertedThread.body,
        date: insertedThread.created_at,
        username: user.username,
        comments: [],
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
      await pgTest.threads.add({ owner_id: user.id });

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