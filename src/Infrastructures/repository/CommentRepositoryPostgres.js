const CommentRepository = require('../../Domains/comments/CommentRepository');
const DetailComment = require('../../Domains/comments/entities/Comment');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

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
    return this._transformToAddedComment(result.rows[0]);
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
    return result.rows.map((row) => this._transformToComment(row));
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

    return { owner: result.rows[0].owner_id };
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

  _transformToAddedComment({
    id, content, owner_id: owner
  }) {
    return new AddedComment({
      id, content, owner
    });
  }

  _transformToComment({
    id, username, content, created_at: date, is_delete: isDelete
  }) {
    return new DetailComment({
      id, username, content, date, isDelete
    });
  }
}

module.exports = CommentRepositoryPostgres;