const AddedReply = require('../../Domains/replies/entities/AddedReply');
const Reply = require('../../Domains/replies/entities/Reply');
const ReplyOwner = require('../../Domains/replies/entities/ReplyOwner');

class ReplyMapper {
  /**
   * Translate result data from database INSERT
   * @param {{
   *   id: string,
   *   content: string,
   *   owner_id: string
   * }} row Persistence Model
   * @returns Domain Entity
   */
  static mapAddedReplyToDomain({
    id, content, owner_id
  }) {
    return new AddedReply({
      id,
      content,
      owner: owner_id,
    });
  }

  /**
   * Translate result data from database SELECT
   * @param {Array<{
   *   id: string,
   *   comment_id: string,
   *   content: string,
   *   username: string,
   *   created_at: Date,
   *   is_delete: boolean,
   * }>} rows Persistence Model
   * @returns Domain Entity
   */
  static mapReplyListToDomain(rows) {
    return rows.map(({
      id,
      comment_id,
      content,
      username,
      created_at,
      is_delete,
    }) => new Reply({
      id,
      commentId: comment_id,
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
  static mapReplyOwnerToDomain({
    owner_id
  }) {
    return new ReplyOwner({
      owner: owner_id,
    });
  }
}

module.exports = ReplyMapper;