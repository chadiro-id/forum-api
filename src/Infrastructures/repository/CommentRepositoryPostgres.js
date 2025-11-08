const CommentRepository = require('../../Domains/comments/CommentRepository');
const CommentMapper = require('../../Commons/utils/CommentMapper');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { threadId, content, owner } = newComment;

    const id = `comment-${this._idGenerator()}`;
    const timestamp = new Date();

    const query = {
      text: `
      INSERT INTO comments
        (id, thread_id, owner_id, content, created_at)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        id, content, owner_id
      `,
      values: [id, threadId, owner, content, timestamp],
    };

    const result = await this._pool.query(query);
    return CommentMapper.mapAddedCommentToDomain(result.rows[0]);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
      SELECT
        c.id, c.content, c.created_at, c.is_delete, u.username
      FROM
        comments c
      LEFT JOIN
        users u
      ON
        u.id = c.owner_id
      WHERE
        c.thread_id = $1
      ORDER BY
        c.created_at ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return CommentMapper.mapCommentListToDomain(result.rows);
  }

  async getCommentForDeletion(id, threadId) {
    const query = {
      text: 'SELECT owner_id FROM comments WHERE id = $1 AND thread_id = $2',
      values: [id, threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return null;
    }

    return CommentMapper.mapCommentOwnerToDomain(result.rows[0]);
  }

  async softDeleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }

  async isCommentExist(id, threadId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2',
      values: [id, threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }
}

module.exports = CommentRepositoryPostgres;