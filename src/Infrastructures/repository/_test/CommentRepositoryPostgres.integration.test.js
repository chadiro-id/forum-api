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
      const expectedAddedComment = new AddedComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: user.id,
      });

      const addedComment = await commentRepo.addComment(newComment);

      const comments = await commentsTable.findById('comment-123');
      expect(comments).toHaveLength(1);

      expect(addedComment).toStrictEqual(expectedAddedComment);
    });

    it('should propagate error when id is exists', async () => {
      await commentsTable.add({ id: 'comment-123', thread_id: thread.id, owner_id: user.id });
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
    it('should correctly resolve and return the array of comment', async () => {
      const {
        id, created_at: date
      } = await commentsTable.add({ thread_id: thread.id, owner_id: user.id });

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

    it('should return all comments including soft-deleted ones', async () => {
      const rawComment1 = await commentsTable.add({
        id: 'comment-101', thread_id: thread.id, owner_id: user.id
      });
      const rawComment2 = await commentsTable.add({
        id: 'comment-102', thread_id: thread.id, owner_id: user.id, is_delete: true
      });

      const comments = await commentRepo.getCommentsByThreadId(thread.id);

      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual(rawComment1.id);
      expect(comments[0].content).toEqual('Sebuah komentar');
      expect(comments[0].username).toEqual(user.username);
      expect(comments[0].date).toEqual(rawComment1.created_at);

      expect(comments[1].id).toEqual(rawComment2.id);
      expect(comments[1].content).toEqual('**komentar telah dihapus**');
      expect(comments[1].username).toEqual(user.username);
      expect(comments[1].date).toEqual(rawComment2.created_at);
    });

    it('should return an empty array when no comment found', async () => {
      const comments = await commentRepo.getCommentsByThreadId(thread.id);
      expect(comments).toEqual([]);
    });
  });

  describe('softDeleteCommentById', () => {
    it('should correctly resolve and not throw error', async () => {
      await commentsTable.add({ thread_id: thread.id, owner_id: user.id });

      await expect(commentRepo.softDeleteCommentById('comment-001'))
        .resolves
        .not.toThrow(NotFoundError);

      const comments = await commentsTable.findById('comment-001');
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
      await commentsTable.add({ thread_id: thread.id, owner_id: user.id });
      await expect(commentRepo.verifyCommentBelongToThread('comment-001', thread.id))
        .resolves.not.toThrow();
    });

    it('should throw NotFoundError when comment not exists', async () => {
      await expect(commentRepo.verifyCommentBelongToThread('nonexistent-comment-id', thread.id))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when comment not belong to thread', async () => {
      const otherUser = await usersTable.add({ username: 'anotheruser', id: 'user-010' });
      const otherThread = await threadsTable.add({ owner_id: otherUser.id, id: 'thread-010' });
      const { id: otherCommentId } = await commentsTable.add({
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
      unauthorizedUser = await usersTable.add({ username: 'unauthorized', id: 'user-999' });
      otherThread = await threadsTable.add({ owner_id: unauthorizedUser.id, id: 'thread-999' });
    });

    beforeEach(async () => {
      const { id } = await commentsTable.add({
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