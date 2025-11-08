const Comment = require('../../Domains/comments/entities/Comment');

class CommentMapper {
  /**
   * Menerjemahkan data hasil SELECT database
   * @param {{
   *   id: string,
   *   content: string,
   *   username: string,
   *   created_at: Date,
   *   is_delete: boolean,
   * }} row Persistence
   * @returns {ThreadDetails} Domain Entity
   */
  static toEntity({
    id, content, username, created_at, is_delete,
  }) {
    return new Comment({
      id,
      content,
      username,
      date: created_at,
      isDelete: is_delete,
    });
  }
}

module.exports = CommentMapper;