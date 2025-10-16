class GetDetailThreadUseCase {
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
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map(({ id }) => id);

    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const repliesGrouped = this._groupRepliesByCommentId(replies);

    thread.comments = comments.map((entry) => {
      entry.replies = repliesGrouped[entry.id] || [];
      return entry;
    });
    console.log('Get Thread Use Case:', JSON.stringify(thread));
    return thread;
  }

  _groupRepliesByCommentId(repliesArray) {
    return repliesArray.reduce((acc, reply) => {
      const commentId = reply.commentId;

      if (!acc[commentId]) {
        acc[commentId] = [];
      }

      acc[commentId].push(reply);

      return acc;
    }, {});
  }
}

module.exports = GetDetailThreadUseCase;