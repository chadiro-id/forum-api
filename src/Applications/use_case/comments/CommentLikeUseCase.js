class CommentLikeUseCase {
  constructor({
    commentRepository,
    commentLikeRepository
  }) {
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(payload) {
    const isCommentExists = await this._commentRepository.isCommentExist(payload.commentId, payload.threadId);
    if (!isCommentExists) {
      throw new Error('COMMENT_LIKE_USE_CASE.COMMENT_NOT_FOUND');
    }

    const commentLike = await this._commentLikeRepository.getByCommentIdAndUserId(payload.commentId, payload.userId);
    if (commentLike) {
      await this._commentLikeRepository.deleteById(commentLike.id);
    } else {
      await this._commentLikeRepository.add({ ...payload });
    }
  }
}

module.exports = CommentLikeUseCase;