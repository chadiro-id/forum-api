const NotFoundError = require('../../Commons/exceptions/NotFoundError');
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

  async deleteCommentById(id) {
    const query = {
      text: 'DELETE FROM comments WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
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
}

module.exports = CommentRepositoryPostgres;