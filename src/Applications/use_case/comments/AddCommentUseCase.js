class AddCommentUseCase {
  constructor(commentRepository) {
    this._commentRepository = commentRepository;
  }

  async execute(userId, _payload) {
    this._verifyUserId(userId);
  }

  _verifyUserId(id) {
    if (!id) {
      throw new Error('ADD_COMMENT_USE_CASE.MISSING_USER_ID');
    }

    if (typeof id !== 'string') {
      throw new Error('ADD_COMMENT_USE_CASE.USER_ID_MUST_BE_A_STRING');
    }
  }
}

module.exports = AddCommentUseCase;