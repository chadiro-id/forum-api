const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const {
  usersTable,
  threadsTable,
  commentsTable,
} = require('../../../../tests/helper/postgres');

describe('[Integration] CommentRepositoryPostgres', () => {
  let commentRepo;
  let user;
  let thread;

  beforeAll(async () => {
    commentRepo = new CommentRepositoryPostgres(pool, () => '123');
    user = await usersTable.add({ username: 'johndoe' });
    thread = await threadsTable.add({ owner: user.id });
  });

  beforeEach(async () => {
    await commentsTable.clean();
  });

  afterAll(async () => {
    await threadsTable.clean();
    await usersTable.clean();
    await pool.end();
  });

  describe('addComment', () => {
    it('should correctly persist the NewComment and return AddedComment', async () => {
      const newComment = new NewComment({
        threadId: thread.id,
        owner: user.id,
        content: 'Sebuah komentar',
      });

      const addedComment = await commentRepo.addComment(newComment);

      const comments = await commentsTable.findById('comment-123');
      expect(comments).toHaveLength(1);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: user.id,
      }));
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return empty array when thread has no comments', async () => {
      const comments = await commentRepo.getCommentsByThreadId(thread.id);
      expect(comments).toEqual([]);
    });

    it('should return thread comments correctly', async () => {
      const {
        id, created_at: date
      } = await commentsTable.add({ threadId: thread.id, owner: user.id });

      const comments = await commentRepo.getCommentsByThreadId(thread.id);

      expect(comments).toHaveLength(1);
      expect(comments[0]).toStrictEqual(new Comment({
        id,
        content: 'Sebuah komentar',
        username: user.username,
        date,
        isDelete: false,
      }));
    });
  });

  describe('softDeleteCommentById', () => {
    it('should correctly resolve and update is delete to true', async () => {
      await commentsTable.add({ threadId: thread.id, owner: user.id });

      await expect(commentRepo.softDeleteCommentById('comment-123'))
        .resolves
        .not.toThrow(NotFoundError);

      const comments = await commentsTable.findById('comment-123');
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
      await commentsTable.add({ threadId: thread.id, owner: user.id });
      await expect(commentRepo.verifyCommentBelongToThread('comment-123', thread.id))
        .resolves.not.toThrow();
    });

    it('should throw NotFoundError when id not exists', async () => {
      await expect(commentRepo.verifyCommentBelongToThread('nonexistent-comment-id', thread.id))
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
      unauthorizedUser = await usersTable.add({ username: 'unauthorized', id: 'user-999' });
      otherThread = await threadsTable.add({ owner: unauthorizedUser.id, id: 'thread-999' });
    });

    beforeEach(async () => {
      const { id } = await commentsTable.add({
        threadId: thread.id,
        owner: authorizedUser.id,
        content: 'Comment for deletion',
      });
      commentId = id;
    });

    it('should correctly resolve and not throw error when authorized', async () => {
      await expect(commentRepo.verifyDeleteComment(commentId, thread.id, authorizedUser.id))
        .resolves.not.toThrow();
    });

    it('should throw NotFoundError when comment id not exists', async () => {
      await expect(commentRepo.verifyDeleteComment('nonexistent-id', thread.id, authorizedUser.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when comment id not belong to thread', async () => {
      await expect(commentRepo.verifyDeleteComment(commentId, otherThread.id, authorizedUser.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when user is not the owner', async () => {
      await expect(commentRepo.verifyDeleteComment(commentId, thread.id, unauthorizedUser.id))
        .rejects.toThrow(AuthorizationError);
    });
  });
});