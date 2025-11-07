const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pgTest = require('../../../../tests/helper/postgres');
const {
  assertDBError,
  expectCommentFromRepository,
} = require('../../../../tests/helper/assertionsHelper');

const FIXED_TIME = '2025-11-05T00:00:00.000Z';
beforeAll(async () => {
  jest.setSystemTime(new Date(FIXED_TIME));
  await pgTest.truncate();
});

afterAll(async () => {
  await pgTest.end();
});

describe('[Integration] CommentRepositoryPostgres', () => {
  let commentRepo;
  let user;
  let thread;

  beforeAll(async () => {
    commentRepo = new CommentRepositoryPostgres(pgTest.getPool(), () => '123');
    user = await pgTest.users.add({ username: 'johndoe' });
    thread = await pgTest.threads.add({ owner: user.id });
  });

  afterEach(async () => {
    await pgTest.comments.clean();
  });

  afterAll(async () => {
    await pgTest.threads.clean();
    await pgTest.users.clean();
  });

  describe('addComment', () => {
    it('should correctly persist the NewComment and return AddedComment', async () => {
      const newComment = new NewComment({
        threadId: thread.id,
        owner: user.id,
        content: 'Sebuah komentar',
      });

      const addedComment = await commentRepo.addComment(newComment);

      const comments = await pgTest.comments.findById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0]).toStrictEqual({
        id: 'comment-123',
        thread_id: newComment.threadId,
        owner_id: newComment.owner,
        content: newComment.content,
        is_delete: false,
        created_at: new Date(FIXED_TIME),
      });

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: user.id,
      }));
    });

    it('should propagate error when id violate constraint', async () => {
      await pgTest.comments.add({ id: 'comment-123', thread_id: thread.id, owner_id: user.id });
      const newComment = new NewComment({
        threadId: thread.id,
        owner: user.id,
        content: 'Sebuah komentar',
      });

      const promise = commentRepo.addComment(newComment);
      await assertDBError(promise);
    });

    it('should propagate error when thread id violate constraint', async () => {
      const newComment = new NewComment({
        threadId: 'nonexistent-thread-id',
        owner: user.id,
        content: 'Sebuah komentar',
      });

      const promise = commentRepo.addComment(newComment);
      await assertDBError(promise);
    });

    it('should propagate error when owner id violate constraint', async () => {
      const newComment = new NewComment({
        threadId: thread.id,
        owner: 'nonexistent-user-id',
        content: 'Sebuah komentar',
      });

      const promise = commentRepo.addComment(newComment);
      await assertDBError(promise);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return all comments including soft-deleted ones', async () => {
      const rawComment1 = await pgTest.comments.add({
        id: 'comment-101', thread_id: thread.id, owner_id: user.id
      });
      const rawComment2 = await pgTest.comments.add({
        id: 'comment-102', thread_id: thread.id, owner_id: user.id, is_delete: true
      });

      const comments = await commentRepo.getCommentsByThreadId(thread.id);

      expect(comments).toHaveLength(2);
      expectCommentFromRepository(comments[0], { ...rawComment1, username: user.username });
      expectCommentFromRepository(comments[1], { ...rawComment2, username: user.username });
    });

    it('should return an empty array when no comment found', async () => {
      const comments = await commentRepo.getCommentsByThreadId(thread.id);
      expect(comments).toStrictEqual([]);
    });
  });

  describe('getCommentForDeletion', () => {
    it('should return object when comment exist', async () => {
      await pgTest.comments.add({
        id: 'comment-001', thread_id: thread.id, owner_id: user.id
      });

      const comment = await commentRepo.getCommentForDeletion('comment-001', thread.id);
      expect(comment).toStrictEqual({ owner: user.id });
    });

    it('should return null when comment not exist', async () => {
      const comment = await commentRepo.getCommentForDeletion('comment-id', 'thread-id');
      expect(comment).toBeNull();
    });
  });

  describe('softDeleteCommentById', () => {
    it('should resolves and update delete status', async () => {
      const insertedComment = await pgTest.comments.add({
        thread_id: thread.id,
        owner_id: user.id,
      });

      await expect(commentRepo.softDeleteCommentById('comment-001'))
        .resolves.not.toThrow();

      const comments = await pgTest.comments.findById('comment-001');
      expect(comments[0]).toStrictEqual({
        id: insertedComment.id,
        thread_id: insertedComment.thread_id,
        owner_id: insertedComment.owner_id,
        content: insertedComment.content,
        is_delete: true,
        created_at: insertedComment.created_at,
      });
    });
  });

  describe('isCommentExist', () => {
    it('should return true when comment exist', async () => {
      await pgTest.comments.add({
        id: 'comment-101', thread_id: thread.id, owner_id: user.id
      });

      const result = await commentRepo.isCommentExist('comment-101', thread.id);
      expect(result).toBe(true);
    });

    it('should return false when comment not exist', async () => {
      const result = await commentRepo.isCommentExist('comment-101', thread.id);
      expect(result).toBe(false);
    });
  });
});