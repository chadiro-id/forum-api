const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pgTest = require('../../../../tests/helper/postgres');
const { expectReplyFromRepository } = require('../../../../tests/helper/assertionsHelper');
const ClientError = require('../../../Commons/exceptions/ClientError');

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
    const expectAddReplyFails = async (newReply) => {
      await expect(replyRepo.addReply(newReply))
        .rejects.toThrow();
      await expect(replyRepo.addReply(newReply))
        .rejects.not.toThrow(ClientError);
    };

    it('should correctly persist the NewReply and return AddedReply', async () => {
      const newReply = new NewReply({
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: userA.id,
      });

      const addedReply = await replyRepo.addReply(newReply);
      const replies = await pgTest.replies.findById('reply-123');

      expect(replies).toHaveLength(1);
      expect(replies[0]).toStrictEqual({
        id: 'reply-123',
        comment_id: newReply.commentId,
        owner_id: newReply.owner,
        content: newReply.content,
        is_delete: false,
        created_at: new Date(FIXED_TIME),
      });

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: newReply.content,
        owner: newReply.owner,
      }));
    });

    it('should propagate error when id is exists', async () => {
      await pgTest.replies.add({ id: 'reply-123', comment_id: commentA.id, owner_id: userB.id });
      const newReply = new NewReply({
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: userA.id,
      });

      await expectAddReplyFails(newReply);
    });

    it('should propagate error when comment not exists', async () => {
      const newReply = new NewReply({
        commentId: 'nonexistent-comment-id',
        content: 'Sebuah balasan',
        owner: userA.id,
      });

      await expectAddReplyFails(newReply);
    });

    it('should propagate error when owner not exists', async () => {
      const newReply = new NewReply({
        commentId: commentA.id,
        content: 'Sebuah balasan',
        owner: 'nonexistent-user-id',
      });

      await expectAddReplyFails(newReply);
    });
  });

  describe('getRepliesByCommentIds', () => {
    it('should correctly resolve and return all replies including soft-deleted ones', async () => {
      const rawReply1 = await pgTest.replies.add({
        id: 'reply-001', comment_id: commentB.id, owner_id: userA.id
      });
      const rawReply2 = await pgTest.replies.add({
        id: 'reply-002', comment_id: commentA.id, owner_id: userB.id, is_delete: true
      });
      const rawReply3 = await pgTest.replies.add({
        id: 'reply-003', comment_id: commentB.id, owner_id: userB.id
      });

      const replies = await replyRepo.getRepliesByCommentIds([commentA.id, commentB.id]);

      expect(replies).toHaveLength(3);
      expectReplyFromRepository(replies[0], { ...rawReply1, username: userA.username });
      expectReplyFromRepository(replies[1], { ...rawReply2, username: userB.username });
      expectReplyFromRepository(replies[2], { ...rawReply3, username: userB.username });
    });

    it('should return an empty array when no reply found', async () => {
      const replies = await replyRepo.getRepliesByCommentIds([commentA.id, commentB.id]);

      expect(replies).toEqual([]);
    });
  });

  describe('softDeleteReplyById', () => {
    it('should correctly resolve and not throw error', async () => {
      await pgTest.replies.add({ comment_id: commentB.id, owner_id: userA.id });

      await expect(replyRepo.softDeleteReplyById('reply-001'))
        .resolves
        .not.toThrow();

      const replies = await pgTest.replies.findById('reply-001');
      expect(replies[0].is_delete).toBe(true);
    });
  });

  // describe('verifyDeleteReply', () => {
  //   let replyId;

  //   beforeEach(async () => {
  //     const { id } = await pgTest.replies.add({
  //       comment_id: commentA.id,
  //       owner_id: userB.id,
  //     });
  //     replyId = id;
  //   });

  //   it('should correctly resolve and not throw error', async () => {
  //     await expect(replyRepo.verifyDeleteReply(replyId, commentA.id, userB.id))
  //       .resolves.not.toThrow();
  //   });

  //   it('should throw NotFoundError when reply not exists', async () => {
  //     await expect(replyRepo.verifyDeleteReply('nonexistent-reply-id', commentA.id, userB.id))
  //       .rejects.toThrow(NotFoundError);
  //   });

  //   it('should throw NotFoundError when reply not belong to comment', async () => {
  //     await expect(replyRepo.verifyDeleteReply(replyId, commentB.id, userB.id))
  //       .rejects.toThrow(NotFoundError);
  //   });

  //   it('should throw AuthorizationError when user is not the owner', async () => {
  //     await expect(replyRepo.verifyDeleteReply(replyId, commentA.id, userA.id))
  //       .rejects.toThrow(AuthorizationError);
  //   });
  // });
});