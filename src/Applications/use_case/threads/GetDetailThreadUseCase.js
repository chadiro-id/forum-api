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
    const thread = await this._threadRepository.getDetailThread(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map(({ id }) => id);

    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const repliesGrouped = this._groupRepliesByCommentId(replies);

    const detailThread = { ...thread, date: thread.created_at };
    delete detailThread.created_at;

    detailThread.comments = comments.map(({
      id, content, username, created_at, is_delete
    }) => ({
      id,
      username,
      date: created_at,
      content: is_delete ? '**komentar telah dihapus**' : content,
      replies: repliesGrouped[id] || [],
    }));

    return detailThread;
  }

  _groupRepliesByCommentId(repliesArray) {
    return repliesArray.reduce((acc, reply) => {
      const commentId = reply.comment_id;

      if (!acc[commentId]) {
        acc[commentId] = [];
      }

      acc[commentId].push({
        id: reply.id,
        content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
        date: reply.created_at,
        username: reply.username,
      });

      return acc;
    }, {});
  }
}

module.exports = GetDetailThreadUseCase;