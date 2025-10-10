class CommentRepository {
  async addComment(_entity) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getCommentById(_id) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteCommentById(_id) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyCommentExists(_id) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyCommentOwner(_id, _owner) {
    throw new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = CommentRepository;