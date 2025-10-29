const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pgTest = require('../../../../tests/helper/postgres');

const expectComment = (comment, expectedSource) => {
  const expectedContent = expectedSource.is_delete
    ? '**komentar telah dihapus**'
    : expectedSource.content;

  expect(comment).toBeInstanceOf(Comment);
  expect(comment.id).toEqual(expectedSource.id);
  expect(comment.content).toEqual(expectedContent);
  expect(comment.username).toEqual(expectedSource.username);
  expect(comment.date).toEqual(expectedSource.created_at);
};

beforeAll(async () => {
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

      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment).toEqual(expect.objectContaining({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: user.id,
      }));
    });

    it('should propagate error when id is exists', async () => {
      await pgTest.comments.add({ id: 'comment-123', thread_id: thread.id, owner_id: user.id });
      const newComment = new NewComment({
        threadId: thread.id,
        owner: user.id,
        content: 'Sebuah komentar',
      });

      await expect(commentRepo.addComment(newComment))
        .rejects.toThrow();
    });

    it('should propagate error when thread not exists', async () => {
      const newComment = new NewComment({
        threadId: 'nonexistent-thread-id',
        owner: user.id,
        content: 'Sebuah komentar',
      });

      await expect(commentRepo.addComment(newComment))
        .rejects.toThrow();
    });

    it('should propagate error when owner not exists', async () => {
      const newComment = new NewComment({
        threadId: thread.id,
        owner: 'nonexistent-user-id',
        content: 'Sebuah komentar',
      });

      await expect(commentRepo.addComment(newComment))
        .rejects.toThrow();
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should correctly resolve and return all comments including soft-deleted ones', async () => {
      const rawComment1 = await pgTest.comments.add({
        id: 'comment-101', thread_id: thread.id, owner_id: user.id
      });
      const rawComment2 = await pgTest.comments.add({
        id: 'comment-102', thread_id: thread.id, owner_id: user.id, is_delete: true
      });

      const comments = await commentRepo.getCommentsByThreadId(thread.id);

      expect(comments).toHaveLength(2);
      expectComment(comments[0], { ...rawComment1, username: user.username });
      expectComment(comments[1], { ...rawComment2, username: user.username });
    });

    it('should return an empty array when no comment found', async () => {
      const comments = await commentRepo.getCommentsByThreadId(thread.id);
      expect(comments).toEqual([]);
    });
  });

  describe('softDeleteCommentById', () => {
    it('should correctly resolve and not throw error', async () => {
      await pgTest.comments.add({ thread_id: thread.id, owner_id: user.id });

      await expect(commentRepo.softDeleteCommentById('comment-001'))
        .resolves
        .not.toThrow(NotFoundError);

      const comments = await pgTest.comments.findById('comment-001');
      expect(comments[0].is_delete).toBe(true);
    });

    it('should throw NotFoundError when id not exists', async () => {
      await expect(commentRepo.softDeleteCommentById('nonexistent-comment-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('verifyCommentBelongToThread', () => {
    it('should correctly resolve and not throw error', async () => {
      await pgTest.comments.add({ thread_id: thread.id, owner_id: user.id });
      await expect(commentRepo.verifyCommentBelongToThread('comment-001', thread.id))
        .resolves.not.toThrow();
    });

    it('should throw NotFoundError when comment not exists', async () => {
      await expect(commentRepo.verifyCommentBelongToThread('nonexistent-comment-id', thread.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when comment not belong to thread', async () => {
      const otherUser = await pgTest.users.add({ username: 'anotheruser', id: 'user-010' });
      const otherThread = await pgTest.threads.add({ owner_id: otherUser.id, id: 'thread-010' });
      const { id: otherCommentId } = await pgTest.comments.add({
        thread_id: otherThread.id,
        owner_id: otherUser.id,
        id: 'comment-999'
      });

      await expect(commentRepo.verifyCommentBelongToThread(otherCommentId, thread.id))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('verifyDeleteComment', () => {
    let authorizedUser;
    let unauthorizedUser;
    let commentId;
    let otherThread;

    beforeAll(async () => {
      authorizedUser = user;
      unauthorizedUser = await pgTest.users.add({ username: 'unauthorized', id: 'user-999' });
      otherThread = await pgTest.threads.add({ owner_id: unauthorizedUser.id, id: 'thread-999' });
    });

    beforeEach(async () => {
      const { id } = await pgTest.comments.add({
        thread_id: thread.id,
        owner_id: authorizedUser.id,
        content: 'Comment for deletion',
      });
      commentId = id;
    });

    it('should correctly resolve and not throw error', async () => {
      await expect(commentRepo.verifyDeleteComment(commentId, thread.id, authorizedUser.id))
        .resolves.not.toThrow();
    });

    it('should throw NotFoundError when comment not exists', async () => {
      await expect(commentRepo.verifyDeleteComment('nonexistent-id', thread.id, authorizedUser.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when comment not belong to thread', async () => {
      await expect(commentRepo.verifyDeleteComment(commentId, otherThread.id, authorizedUser.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when user is not the owner', async () => {
      await expect(commentRepo.verifyDeleteComment(commentId, thread.id, unauthorizedUser.id))
        .rejects.toThrow(AuthorizationError);
    });
  });
});