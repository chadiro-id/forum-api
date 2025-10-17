const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const { usersTable, threadsTable } = require('../../../../tests/helper/postgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

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
});