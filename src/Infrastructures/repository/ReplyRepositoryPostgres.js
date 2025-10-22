const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const Reply = require('../../Domains/replies/entities/Reply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { commentId, content, owner } = newReply;

    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: `
      INSERT INTO replies
        (id, comment_id, owner_id, content)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id, content, owner_id
      `,
      values: [id, commentId, owner, content],
    };

    const result = await this._pool.query(query);
    return this._transformToAddedReply(result.rows[0]);
  }

  async getRepliesByCommentIds(commentIds) {
    const query = {
      text: `
      SELECT
        r.id, r.content, r.comment_id, r.created_at, r.is_delete, u.username
      FROM
        replies r
      LEFT JOIN
        users u
      ON
        u.id = r.owner_id
      WHERE
        r.comment_id = ANY($1::text[])
      ORDER BY
        r.created_at ASC
      `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => this._transformToReply(row));
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

  async verifyReplyBelongToComment(id, commentId) {
    const query = {
      text: 'SELECT comment_id FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Balasan tidak ada, id tidak ditemukan');
    }

    if (result.rows[0].comment_id !== commentId) {
      throw new NotFoundError('Balasan untuk komentar tidak ditemukan, id tidak terkait');
    }
  }

  async verifyDeleteReply(id, commentId, owner) {
    const query = {
      text: 'SELECT comment_id, owner_id FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Balasan tidak ada, id tidak ditemukan');
    }

    if (result.rows[0].comment_id !== commentId) {
      throw new NotFoundError('Balasan untuk komentar tidak ditemukan, id tidak terkait');
    }

    if (result.rows[0].owner_id !== owner) {
      throw new AuthorizationError('Anda tidak memiliki hak akses');
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

  _transformToAddedReply({
    id, content, owner_id: owner
  }) {
    return new AddedReply({
      id, content, owner
    });
  }

  _transformToReply({
    id,
    comment_id: commentId,
    username,
    content,
    created_at: date,
    is_delete: isDelete,
  }) {
    return new Reply({
      id, commentId, username, content, date, isDelete
    });
  }
}

module.exports = ReplyRepositoryPostgres;