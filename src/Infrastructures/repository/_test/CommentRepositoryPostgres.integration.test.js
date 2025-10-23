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
  let currentUser;
  let thread;

  beforeAll(async () => {
    commentRepo = new CommentRepositoryPostgres(pool, () => '123');
    currentUser = await usersTable.add({ username: 'johndoe' });
    thread = await threadsTable.add({ owner: currentUser.id });
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
    let newComment;

    beforeAll(() => {
      newComment = new NewComment({
        threadId: thread.id,
        owner: currentUser.id,
        content: 'Sebuah komentar',
      });
    });

    it('should persist the NewComment', async () => {
      await commentRepo.addComment(newComment);
      const comments = await commentsTable.findById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return AddedComment', async () => {
      const addedComment = await commentRepo.addComment(newComment);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: currentUser.id,
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
      } = await commentsTable.add({ threadId: thread.id, owner: currentUser.id });

      const comments = await commentRepo.getCommentsByThreadId(thread.id);

      expect(comments).toHaveLength(1);
      expect(comments[0]).toStrictEqual(new Comment({
        id,
        content: 'Sebuah komentar',
        username: currentUser.username,
        date,
        isDelete: false,
      }));
    });
  });

  describe('softDeleteCommentById', () => {
    it('should correctly resolve and update is delete to true', async () => {
      await commentsTable.add({ threadId: thread.id, owner: currentUser.id });

      await expect(commentRepo.softDeleteCommentById('comment-123'))
        .resolves
        .not.toThrow(NotFoundError);

      const comments = await commentsTable.findById('comment-123');
      expect(comments[0].is_delete).toBe(true);
    });

    it('should throw NotFoundError when id not exists', async () => {
      await expect(commentRepo.softDeleteCommentById('comment-123'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('verifyCommentBelongToThread', () => {
    it('should correctly resolve and not throw error', async () => {
      await commentsTable.add({ threadId: thread.id, owner: currentUser.id });
      await expect(commentRepo.verifyCommentBelongToThread('comment-123', thread.id))
        .resolves.not.toThrow();
    });

    it('should throw NotFoundError when id not exists', async () => {
      await expect(commentRepo.verifyCommentBelongToThread('nonexistent-comment-id', thread.id))
        .rejects.toThrow(NotFoundError);
    });
  });
});