const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const Reply = require('../../../Domains/replies/entities/Reply');
const ReplyOwner = require('../../../Domains/replies/entities/ReplyOwner');
const pgTest = require('../../../../tests/helper/postgres');
const { assertDBError } = require('../../../../tests/helper/assertionsHelper');

const FIXED_TIME = '2025-11-05T00:00:00.000Z';
beforeAll(async () => {
  jest.setSystemTime(new Date(FIXED_TIME));
  await pgTest.truncate();
});

afterAll(async () => {
  await pgTest.end();
});

describe('[Integration] ReplyRepositoryPostgres', () => {
  let replyRepo;
  let userA;
  let userB;
  let thread;
  let commentA;
  let commentB;

  beforeAll(async () => {
    replyRepo = new ReplyRepositoryPostgres(pgTest.getPool(), () => '123');
    userA = await pgTest.users.add({ id: 'user-123', username: 'johndoe' });
    userB = await pgTest.users.add({ id: 'user-456', username: 'whoami' });
    thread = await pgTest.threads.add({ owner_id: userA.id });
    commentA = await pgTest.comments.add({ id: 'comment-123', thread_id: thread.id, owner_id: userA.id });
    commentB = await pgTest.comments.add({ id: 'comment-456', thread_id: thread.id, owner_id: userB.id });
  });

  afterEach(async () => {
    await pgTest.replies.clean();
  });

  afterAll(async () => {
    await pgTest.comments.clean();
    await pgTest.threads.clean();
    await pgTest.users.clean();
  });

  describe('addReply', () => {
    it('should correctly persist the NewReply and return AddedReply', async () => {
      const newReply = new NewReply({
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: userA.id,
      });

      const addedReply = await replyRepo.addReply(newReply);
      const replies = await pgTest.replies.findById('reply-123');

      expect(replies).toStrictEqual([
        {
          id: 'reply-123',
          comment_id: newReply.commentId,
          owner_id: newReply.owner,
          content: newReply.content,
          is_delete: false,
          created_at: new Date(FIXED_TIME),
        },
      ]);

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: newReply.content,
        owner: newReply.owner,
      }));
    });

    it('should propagate error when id violate constraint', async () => {
      await pgTest.replies.add({ id: 'reply-123', comment_id: commentA.id, owner_id: userB.id });
      const newReply = new NewReply({
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: userA.id,
      });

      const promise = replyRepo.addReply(newReply);
      await assertDBError(promise);
    });

    it('should propagate error when comment id violate constraint', async () => {
      const newReply = new NewReply({
        commentId: 'nonexistent-comment-id',
        content: 'Sebuah balasan',
        owner: userA.id,
      });

      const promise = replyRepo.addReply(newReply);
      await assertDBError(promise);
    });

    it('should propagate error when owner id violate constraint', async () => {
      const newReply = new NewReply({
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: 'nonexistent-user-id',
      });

      const promise = replyRepo.addReply(newReply);
      await assertDBError(promise);
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should return all replies including soft-deleted ones', async () => {
      const rawReply1 = await pgTest.replies.add({
        id: 'reply-001', comment_id: commentB.id, owner_id: userA.id
      });
      const rawReply2 = await pgTest.replies.add({
        id: 'reply-002', comment_id: commentA.id, owner_id: userB.id, is_delete: true
      });

      const replies = await replyRepo.getRepliesByCommentIds([commentA.id, commentB.id]);
      expect(replies).toStrictEqual([
        new Reply({
          id: rawReply1.id,
          commentId: rawReply1.comment_id,
          content: rawReply1.content,
          username: userA.username,
          date: rawReply1.created_at,
          isDelete: rawReply1.is_delete
        }),
        new Reply({
          id: rawReply2.id,
          commentId: rawReply2.comment_id,
          content: rawReply2.content,
          username: userB.username,
          date: rawReply2.created_at,
          isDelete: rawReply2.is_delete,
        }),
      ]);
    });

    it('should return an empty array when no reply found', async () => {
      const replies = await replyRepo.getRepliesByCommentIds([commentA.id, commentB.id]);
      expect(replies).toStrictEqual([]);
    });
  });

  describe('getReplyForDeletion', () => {
    it('should return object when reply exist', async () => {
      await pgTest.replies.add({
        id: 'reply-001',
        comment_id: commentB.id,
        owner_id: userA.id,
      });

      const reply = await replyRepo.getReplyForDeletion('reply-001', commentB.id, thread.id);
      expect(reply).toStrictEqual(new ReplyOwner({ owner: userA.id }));
    });

    it('should return null when reply not exist', async () => {
      const reply = await replyRepo.getReplyForDeletion('reply-id', 'comment-id', 'thread-id');
      expect(reply).toBeNull();
    });
  });

  describe('softDeleteReplyById', () => {
    it('should resolves and update delete status correctly', async () => {
      const insertedReply = await pgTest.replies.add({
        comment_id: commentB.id,
        owner_id: userA.id,
      });

      await expect(replyRepo.softDeleteReplyById('reply-001'))
        .resolves.not.toThrow();

      const replies = await pgTest.replies.findById('reply-001');
      expect(replies).toStrictEqual([
        {
          id: insertedReply.id,
          comment_id: insertedReply.comment_id,
          owner_id: insertedReply.owner_id,
          content: insertedReply.content,
          is_delete: true,
          created_at: insertedReply.created_at,
        },
      ]);
    });
  });
});