const AddedComment = require('../../Domains/comments/entities/AddedComment');

class AddedCommentMapper {
  /**
   * Menerjemahkan data hasil INSERT database
   * @param {{ id: string, content: string, owner_id: string }} row Persistence
   * @returns {AddedComment} Domain Entity
   */
  static toEntity({
    id, content, owner_id
  }) {
    return new AddedComment({
      id,
      content,
      owner: owner_id,
    });
  }
}

module.exports = AddedCommentMapper;