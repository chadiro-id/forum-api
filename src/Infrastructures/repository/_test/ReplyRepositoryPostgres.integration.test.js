const pool = require('../../database/postgres/pool');
const {
  usersTable,
  threadsTable,
  commentsTable,
  repliesTable,
} = require('../../../../tests/helper/postgres');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('[Integration] ReplyRepositoryPostgres', () => {
  let replyRepo;
  let currentUser;
  let threadId;
  let commentId;

  beforeAll(async () => {
    replyRepo = new ReplyRepositoryPostgres(pool, () => '123');
    currentUser = await usersTable.add({ username: 'johndoe' });
    threadId = await threadsTable.add({ owner: currentUser.id });
    commentId = await commentsTable.add({ threadId, owner: currentUser.id });
  });

  beforeEach(async () => {
    await repliesTable.clean();
  });

  afterAll(async () => {
    await repliesTable.clean();
    await commentsTable.clean();
    await threadsTable.clean();
    await usersTable.clean();
    await pool.end();
  });

  describe('addReply', () => {
    let newReply;

    beforeAll(() => {
      newReply = new NewReply({
        commentId,
        content: 'Sebuah balasan',
        owner: currentUser.id,
      });
    });

    it('should persist the NewReply entity correctly', async () => {
      await replyRepo.addReply(newReply);
      const replies = await repliesTable.findById('reply-123');
      expect(replies).toHaveLength(1);
    });

    it('should return the AddedReply entity correctly', async () => {
      const addedReply = await replyRepo.addReply(newReply);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'Sebuah balasan',
        owner: 'user-123',
      }));
    });
  });
});