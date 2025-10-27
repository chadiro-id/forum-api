const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const Reply = require('../../../Domains/replies/entities/Reply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pgTest = require('../../../../tests/helper/postgres');

describe('[Integration] ReplyRepositoryPostgres', () => {
  let replyRepo;
  let userA;
  let userB;
  let thread;
  let commentA;
  let commentB;

  beforeAll(async () => {
    replyRepo = new ReplyRepositoryPostgres(pool, () => '123');
  });

  beforeEach(async () => {
    await pgTest.truncate();
    userA = await pgTest.users().add({ id: 'user-101', username: 'johndoe' });
    userB = await pgTest.users().add({ id: 'user-102', username: 'whoami' });
    thread = await pgTest.threads().add({ owner_id: userA.id });
    commentA = await pgTest.comments().add({ id: 'comment-101', thread_id: thread.id, owner_id: userA.id });
    commentB = await pgTest.comments().add({ id: 'comment-102', thread_id: thread.id, owner_id: userB.id });
  });

  afterAll(async () => {
    await pgTest.truncate();
    await pool.end();
  });

  describe('addReply', () => {
    it('should correctly persist the NewReply and return AddedReply', async () => {
      const newReply = new NewReply({
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: userA.id,
      });

      const addedReply = await replyRepo.addReply(newReply);

      const replies = await pgTest.replies().findById('reply-123');
      expect(replies).toHaveLength(1);

      expect(addedReply).toBeInstanceOf(AddedReply);
      expect(addedReply).toEqual(expect.objectContaining({
        id: 'reply-123',
        content: 'Sebuah balasan',
        owner: userA.id
      }));
    });

    it('should propagate error when id is exists', async () => {
      await pgTest.replies().add({ id: 'reply-123', comment_id: commentA.id, owner_id: userB.id });
      const newReply = new NewReply({
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: userA.id,
      });

      await expect(replyRepo.addReply(newReply))
        .rejects.toThrow();
    });

    it('should propagate error when comment not exists', async () => {
      const newReply = new NewReply({
        commentId: 'nonexistent-comment-id',
        content: 'Sebuah balasan',
        owner: userA.id,
      });

      await expect(replyRepo.addReply(newReply))
        .rejects.toThrow();
    });

    it('should propagate error when owner not exists', async () => {
      const newReply = new NewReply({
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: 'nonexistent-user-id',
      });

      await expect(replyRepo.addReply(newReply))
        .rejects.toThrow();
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should correctly resolve and return all replies including soft-deleted ones', async () => {
      const rawReply1 = await pgTest.replies().add({
        id: 'reply-001', comment_id: commentB.id, owner_id: userA.id
      });
      const rawReply2 = await pgTest.replies().add({
        id: 'reply-002', comment_id: commentA.id, owner_id: userB.id, is_delete: true
      });
      const rawReply3 = await pgTest.replies().add({
        id: 'reply-003', comment_id: commentB.id, owner_id: userB.id
      });

      const replies = await replyRepo.getRepliesByCommentIds([commentA.id, commentB.id]);

      expect(replies).toHaveLength(3);
      expect(replies[0]).toBeInstanceOf(Reply);
      expect(replies[0].id).toEqual(rawReply1.id);
      expect(replies[0].content).toEqual(rawReply1.content);
      expect(replies[0].username).toEqual(userA.username);
      expect(replies[0].date).toEqual(rawReply1.created_at);

      expect(replies[1]).toBeInstanceOf(Reply);
      expect(replies[1].id).toEqual(rawReply2.id);
      expect(replies[1].content).toEqual('**balasan telah dihapus**');
      expect(replies[1].username).toEqual(userB.username);
      expect(replies[1].date).toEqual(rawReply2.created_at);

      expect(replies[2]).toBeInstanceOf(Reply);
      expect(replies[2].id).toEqual(rawReply3.id);
      expect(replies[2].content).toEqual(rawReply3.content);
      expect(replies[2].username).toEqual(userB.username);
      expect(replies[2].date).toEqual(rawReply3.created_at);
    });

    it('should return an empty array when no reply found', async () => {
      const replies = await replyRepo.getRepliesByCommentIds([commentA.id, commentB.id]);

      expect(replies).toEqual([]);
    });
  });

  describe('softDeleteReplyById', () => {
    it('should correctly resolve and not throw error', async () => {
      await pgTest.replies().add({ comment_id: commentB.id, owner_id: userA.id });

      await expect(replyRepo.softDeleteReplyById('reply-001'))
        .resolves
        .not.toThrow(NotFoundError);

      const replies = await pgTest.replies().findById('reply-001');
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
      const { id } = await pgTest.replies().add({
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

    it('should throw AuthorizationError when user is not the owner', async () => {
      await expect(replyRepo.verifyDeleteReply(replyId, commentA.id, userA.id))
        .rejects.toThrow(AuthorizationError);
    });
  });
});