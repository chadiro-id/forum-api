class GetDetailThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    const detailThread = await this._threadRepository.getDetailThread(threadId);
    const threadComments = await this._commentRepository.getCommentsByThreadId(threadId);

    detailThread.comments = threadComments;
    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;