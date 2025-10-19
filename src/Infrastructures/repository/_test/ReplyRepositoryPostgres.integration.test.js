const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const Reply = require('../../../Domains/replies/entities/Reply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const {
  usersTable,
  threadsTable,
  commentsTable,
  repliesTable,
} = require('../../../../tests/helper/postgres');

describe('[Integration] ReplyRepositoryPostgres', () => {
  let replyRepo;
  let userA;
  let userB;
  let thread;
  let commentA;
  let commentB;

  beforeAll(async () => {
    replyRepo = new ReplyRepositoryPostgres(pool, () => '123');
    userA = await usersTable.add({ id: 'user-123', username: 'johndoe' });
    userB = await usersTable.add({ id: 'user-456', username: 'whoami' });
    thread = await threadsTable.add({ owner: userA.id });
    commentA = await commentsTable.add({ id: 'comment-123', threadId: thread.id, owner: userA.id });
    commentB = await commentsTable.add({ id: 'comment-456', threadId: thread.id, owner: userB.id });
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
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: userA.id,
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

  describe('getRepliesByCommentIds', () => {
    it('should return an empty array when no reply found for related comment ids', async () => {
      const replies = await replyRepo.getRepliesByCommentIds([commentA.id, commentB.id]);

      expect(replies).toEqual([]);
    });

    it('should correctly return replies related to comment ids', async () => {
      const replyA = await repliesTable.add({
        id: 'reply-123', commentId: commentB.id, owner: userA.id
      });
      const replyB = await repliesTable.add({
        id: 'reply-456', commentId: commentA.id, owner: userB.id
      });
      const replyC = await repliesTable.add({
        id: 'reply-789', commentId: commentB.id, owner: userB.id
      });

      const replies = await replyRepo.getRepliesByCommentIds([commentA.id, commentB.id]);

      expect(replies).toHaveLength(3);
      expect(replies[0]).toStrictEqual(new Reply({
        id: replyA.id,
        commentId: commentB.id,
        content: 'Sebuah balasan',
        username: userA.username,
        date: replyA.created_at,
        isDelete: false,
      }));
      expect(replies[1]).toStrictEqual(new Reply({
        id: replyB.id,
        commentId: commentA.id,
        content: 'Sebuah balasan',
        username: userB.username,
        date: replyB.created_at,
        isDelete: false,
      }));
      expect(replies[2]).toStrictEqual(new Reply({
        id: replyC.id,
        commentId: commentB.id,
        content: 'Sebuah balasan',
        username: userB.username,
        date: replyC.created_at,
        isDelete: false,
      }));
    });
  });

  describe('softDeleteReplyById', () => {
    it('should throw NotFoundError when id is not exists', async () => {
      await expect(replyRepo.softDeleteReplyById('reply-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should resolves and update delete status of reply', async () => {
      await repliesTable.add({ commentId: commentB.id, owner: userA.id });

      await expect(replyRepo.softDeleteReplyById('reply-123'))
        .resolves
        .not.toThrow(NotFoundError);

      const replies = await repliesTable.findById('reply-123');
      expect(replies[0].is_delete).toBe(true);
    });
  });

  describe('verifyReplyOwner', () => {
    it('should throw NotFoundError when reply id not exists', async () => {
      await expect(replyRepo.verifyReplyOwner('reply-123', 'johndoe'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when reply id and owner not match', async () => {
      await repliesTable.add({ commentId: commentA.id, owner: userB.id });

      await expect(replyRepo.verifyReplyOwner('reply-123', userA.id))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should resolves and not throw error when reply id and owner match', async () => {
      await repliesTable.add({ commentId: commentB.id, owner: userA.id });

      await expect(replyRepo.verifyReplyOwner('reply-123', userA.id))
        .resolves
        .not.toThrow();
    });
  });
});