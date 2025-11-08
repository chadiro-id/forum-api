const AddedComment = require('../../Domains/comments/entities/AddedComment');
const Comment = require('../../Domains/comments/entities/Comment');
const CommentOwner = require('../../Domains/comments/entities/CommentOwner');

class CommentMapper {
  /**
   * Translate result data from database INSERT
   * @param {{ id: string, content: string, owner_id: string }} row Persistence Model
   * @returns Domain Entity
   */
  static mapAddedCommentToDomain({
    id, content, owner_id
  }) {
    return new AddedComment({
      id,
      content,
      owner: owner_id,
    });
  }

  /**
   * Translate result data from database SELECT
   * @param {Array<{
   *   id: string,
   *   content: string,
   *   username: string,
   *   created_at: Date,
   *   is_delete: boolean,
   * }>} rows Persistence Model
   * @returns Domain Entity
   */
  static mapCommentListToDomain(rows) {
    return rows.map(({
      id,
      content,
      username,
      created_at,
      is_delete,
    }) => new Comment({
      id,
      content,
      username,
      date: created_at,
      isDelete: is_delete,
    }));
  }

  /**
   * Translate result data from database SELECT
   * @param {{ owner_id: string }} row Persistence Model
   * @returns Domain Entity
   */
  static mapCommentOwnerToDomain({
    owner_id
  }) {
    return new CommentOwner({
      owner: owner_id,
    });
  }
}

module.exports = CommentMapper;