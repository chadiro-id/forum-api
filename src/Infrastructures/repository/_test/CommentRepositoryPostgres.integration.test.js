const pool = require('../../database/postgres/pool');
const {
  usersTable,
  threadsTable,
  commentsTable,
} = require('../../../../tests/helper/postgres');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('[Integration] CommentRepositoryPostgres', () => {
  let commentRepo;
  let currentUser;
  let thread;

  beforeAll(async () => {
    commentRepo = new CommentRepositoryPostgres(pool, () => '123');
    currentUser = await usersTable.add({ username: 'johndoe' });
    thread = await threadsTable.add({});
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
        content: 'Sebuah komentar',
        owner: currentUser.id,
      });
    });

    it('should persist the NewComment entity', async () => {
      await commentRepo.addComment(newComment);
      const comments = await commentsTable.findById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return AddedComment entity', async () => {
      const addedComment = await commentRepo.addComment(newComment);
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: currentUser.id,
      }));
    });
  });
});