const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const { usersTable, threadsTable } = require('../../../../tests/helper/postgres');
const NewThread = require('../../../Domains/threads/entities/NewThread');

describe('[Integration] ThreadRepositoryPostgres', () => {
  let threadRepo;
  let currentUser;

  beforeAll(async () => {
    threadRepo = new ThreadRepositoryPostgres(pool, () => '123');
    currentUser = await usersTable.add({ username: 'whoami' });
  });

  afterAll(async () => {
    await usersTable.clean();
    await pool.end();
  });

  describe('addThread', () => {
    it('should persist the new thread entity correctly', async () => {
      const newThread = new NewThread({
        title: 'Sebuah thread',
        body: 'Isi thread',
        owner: currentUser.id,
      });

      await threadRepo.addThread(newThread);

      const thread = await threadsTable.findById('thread-123');
      expect(thread).toHaveLength(1);
    });
  });
});