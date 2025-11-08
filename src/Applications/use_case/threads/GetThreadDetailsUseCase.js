const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const ArrayGroupUtils = require('../../utilities/ArrayGroupUtils');

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
    const [thread, comments] = await Promise.all([
      this._threadRepository.getThreadById(threadId),
      this._commentRepository.getCommentsByThreadId(threadId)
    ]);

    if (thread instanceof ThreadDetails === false) {
      throw new Error('GET_THREAD_DETAILS_USE_CASE.THREAD_MUST_BE_INSTANCE_OF_THREAD_DETAILS_ENTITY');
    }

    if (comments.length > 0) {
      const commentIds = comments.map(({ id }) => id);

      const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
      const repliesGrouped = ArrayGroupUtils.groupToObjectBy(replies, 'commentId');

      thread.comments = replies.length > 0
        ? comments.map((comment) => {
          comment.replies = repliesGrouped[comment.id] || [];
          return comment;
        })
        : comments;
    }

    return thread;
  }
}

module.exports = GetThreadDetailsUseCase;