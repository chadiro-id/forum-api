const ReplyMapper = require('../../Commons/utils/ReplyMapper');
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
    const timestamp = new Date();

    const query = {
      text: `
      INSERT INTO replies
        (id, comment_id, owner_id, content, created_at)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        id, content, owner_id
      `,
      values: [id, commentId, owner, content, timestamp],
    };

    const result = await this._pool.query(query);
    return ReplyMapper.mapAddedReplyToDomain(result.rows[0]);
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
    return ReplyMapper.mapReplyListToDomain(result.rows);
  }

  async getReplyForDeletion(id, commentId, threadId) {
    const query = {
      text: `
      SELECT r.owner_id
      FROM replies r
      JOIN comments c ON r.comment_id = c.id
      WHERE r.id = $1
        AND r.comment_id = $2
        AND c.thread_id = $3
      `,
      values: [id, commentId, threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return null;
    }

    return { owner: result.rows[0].owner_id };
  }

  async softDeleteReplyById(id) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;