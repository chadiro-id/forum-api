const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const Comment = require('../../Domains/comments/entities/Comment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { thread_id, content, owner_id } = newComment;

    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments (id, thread_id, owner_id, content) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, thread_id, owner_id, content],
    };

    const result = await this._pool.query(query);

    return result.rows[0].id;
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

  async softDeleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Tidak dapat menghapus komentar, id tidak ditemukan');
    }
  }

  async verifyCommentExists(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Komentar tidak ada, id tidak ditemukan');
    }
  }

  async verifyCommentOwner(id, owner) {
    const query = {
      text: 'SELECT owner_id FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Komentar tidak ada, id tidak ditemukan');
    }

    if (owner !== result.rows[0].owner_id) {
      throw new AuthorizationError('Anda tidak memiliki hak akses');
    }
  }

  _transformToComment({
    id, username, content, created_at: date, is_delete: isDelete
  }) {
    console.log('[CommentRepository] transform -> id:', id);
    console.log('[CommentRepository] transform -> content:', content);
    console.log('[CommentRepository] transform -> username:', username);
    console.log('[CommentRepository] transform -> date:', date);
    console.log('[CommentRepository] transform -> isDelete:', isDelete);

    return new Comment({
      id, username, content, date, isDelete
    });
  }
}

module.exports = CommentRepositoryPostgres;