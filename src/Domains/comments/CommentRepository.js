class CommentRepository {
  async addComment(_userId, _content) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getCommentById(_id) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteCommentById(_id) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = CommentRepository;