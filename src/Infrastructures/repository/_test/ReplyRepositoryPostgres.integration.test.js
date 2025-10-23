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
    thread = await threadsTable.add({ owner_id: userA.id });
    commentA = await commentsTable.add({ id: 'comment-123', thread_id: thread.id, owner_id: userA.id });
    commentB = await commentsTable.add({ id: 'comment-456', thread_id: thread.id, owner_id: userB.id });
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
        content: newReply.content,
        owner: newReply.owner,
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
        id: 'reply-001', comment_id: commentB.id, owner_id: userA.id
      });
      const replyB = await repliesTable.add({
        id: 'reply-002', comment_id: commentA.id, owner_id: userB.id
      });
      const replyC = await repliesTable.add({
        id: 'reply-003', comment_id: commentB.id, owner_id: userB.id
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
    it('should correctly resolve and not throw error', async () => {
      await repliesTable.add({ comment_id: commentB.id, owner_id: userA.id });

      await expect(replyRepo.softDeleteReplyById('reply-001'))
        .resolves
        .not.toThrow(NotFoundError);

      const replies = await repliesTable.findById('reply-001');
      expect(replies[0].is_delete).toBe(true);
    });

    it('should throw NotFoundError when id not exists', async () => {
      await expect(replyRepo.softDeleteReplyById('nonexistent-reply-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('verifyDeleteReply', () => {
    let replyId;

    beforeEach(async () => {
      const { id } = await repliesTable.add({
        comment_id: commentA.id,
        owner_id: userB.id,
      });
      replyId = id;
    });

    it('should correctly resolve and not throw error', async () => {
      await expect(replyRepo.verifyDeleteReply(replyId, commentA.id, userB.id))
        .resolves.not.toThrow();
    });

    it('should throw NotFoundError when reply not exists', async () => {
      await expect(replyRepo.verifyDeleteReply('nonexistent-reply-id', commentA.id, userB.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when reply not belong to comment', async () => {
      await expect(replyRepo.verifyDeleteReply(replyId, commentB.id, userB.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when user is not owner', async () => {
      await expect(replyRepo.verifyDeleteReply(replyId, commentA.id, userA.id))
        .rejects.toThrow(AuthorizationError);
    });
  });
});