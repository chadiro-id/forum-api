const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { commentId, content, ownerId } = newReply;

    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO replies (id, content, comment_id, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, content, owner_id',
      values: [id, content, commentId, ownerId],
    };

    const result = await this._pool.query(query);
    return {
      id: result.rows[0].id,
      content: result.rows[0].content,
      owner: result.rows[0].owner_id,
    };
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) return [];

    const query = {
      text: `
        SELECT r.id, r.content, r.comment_id, r.created_at, r.is_delete, u.username
        FROM replies r
        LEFT JOIN users u
        ON u.id = r.owner_id
        WHERE r.comment_id = ANY($1::text[])
        ORDER BY r.created_at ASC
      `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async softDeleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Tidak dapat menghapus balasan, id tidak ditemukan');
    }
  }

  async verifyReplyOwner(id, owner) {
    const query = {
      text: 'SELECT owner_id FROM replies WHERE id = $1',
      values: [id]
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Tidak dapat memverifikasi pemilik, id balasan tidak ditemukan');
    }

    if (result.rows[0].owner_id !== owner) {
      throw new AuthorizationError('Anda tidak memiliki hak akses');
    }
  }
}

module.exports = ReplyRepositoryPostgres;