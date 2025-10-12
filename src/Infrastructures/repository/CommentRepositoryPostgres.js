const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AddedCommentEntity = require('../../Domains/comments/entities/AddedCommentEntity');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(entity) {
    const { threadId, content, ownerId } = entity;

    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments (id, content, thread_id, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, content, owner_id',
      values: [id, content, threadId, ownerId],
    };

    const result = await this._pool.query(query);

    return new AddedCommentEntity({
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner_id,
    });
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `
        SELECT c.id, c.content, c.created_at, c.is_delete, u.username
        FROM comments c
        LEFT JOIN users u
        ON u.id = c.owner_id
        WHERE c.thread_id = $1
        ORDER BY c.created_at ASC
      `,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async softDeleteCommentById(id) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1',
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
      text: 'SELECT id, owner_id FROM comments WHERE id = $1',
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
}

module.exports = CommentRepositoryPostgres;