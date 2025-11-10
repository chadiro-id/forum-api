class GetThreadDetailsUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadDetails(threadId);
    if (thread === null) {
      throw new Error('GET_THREAD_DETAILS_USE_CASE.THREAD_NOT_FOUND');
    }

    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    if (comments.length > 0) {
      const commentIds = comments.map(({ id }) => id);

      const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
      const replyGroup = Object.groupBy(replies, ({ commentId }) => commentId);

      thread.comments = replies.length > 0
        ? comments.map((comment) => {
          comment.replies = replyGroup[comment.id] || [];
          return comment;
        })
        : comments;
    }

    return thread;
  }
}

module.exports = GetThreadDetailsUseCase;