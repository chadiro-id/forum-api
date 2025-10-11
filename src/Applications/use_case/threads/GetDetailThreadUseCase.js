class GetDetailThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getDetailThread(threadId);
    const threadComments = await this._commentRepository.getCommentsByThreadId(threadId);

    const detailThread = { ...thread, date: thread.created_at };
    delete detailThread.created_at;

    detailThread.comments = threadComments.map(({
      id, content, username, created_at, is_delete
    }) => {
      const mappedContent = is_delete ? '**komentar telah dihapus**' : content;
      return {
        id,
        username,
        date: created_at,
        content: mappedContent,
      };
    });

    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;