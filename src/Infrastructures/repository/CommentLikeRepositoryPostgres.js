const CommentLikeRepository = require('../../Domains/comments/CommentLikeRepository');
const CommentLike = require('../../Domains/comments/entities/CommentLike');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async add({ commentId, userId }) {
    const id = `cmt-like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO comment_likes VALUES ($1, $2, $3)',
      values: [id, commentId, userId]
    };

    await this._pool.query(query);
  }

  async getByCommentIdAndUserId(commentId, userId) {
    const query = {
      text: 'SELECT id, comment_id, user_id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId]
    };

    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      return null;
    }

    return new CommentLike({
      id: result.rows[0].id,
      commentId: result.rows[0].comment_id,
      userId: result.rows[0].user_id
    });
  }

  async getCommentsLikeCount(commentIds) {
    const query = {
      text: 'SELECT comment_id, COUNT(id) FROM comment_likes WHERE comment_id = ANY($1::text[]) GROUP BY comment_id',
      values: [commentIds],
    };

    const result = await this._pool.query(query);
    return result.rows.map(({ comment_id, count }) => ({ commentId: comment_id, likeCount: count }));
  }

  async deleteById(id) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentLikeRepositoryPostgres;