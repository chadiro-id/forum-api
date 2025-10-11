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
}

module.exports = ReplyRepositoryPostgres;