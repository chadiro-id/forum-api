const DetailThread = require('../../../Domains/threads/entities/ThreadDetails');

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
    const [thread, comments] = await Promise.all([
      this._threadRepository.getThreadById(threadId),
      this._commentRepository.getCommentsByThreadId(threadId)
    ]);

    if (thread instanceof DetailThread === false) {
      throw new Error('GET_DETAIL_THREAD_USE_CASE.DETAIL_THREAD_MUST_BE_INSTANCE_OF_DETAIL_THREAD_ENTITY');
    }

    const commentIds = comments.map(({ id }) => id);

    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const repliesGrouped = this._groupRepliesByCommentId(replies);

    thread.comments = comments.map((entry) => {
      entry.replies = repliesGrouped[entry.id] || [];
      return entry;
    });

    return thread;
  }

  _groupRepliesByCommentId(repliesArray = []) {
    return repliesArray.reduce((acc, reply) => {
      const commentId = reply.commentId;
      (acc[commentId] ||= []).push(reply);
      return acc;
    }, {});
  }
}

module.exports = GetDetailThreadUseCase;