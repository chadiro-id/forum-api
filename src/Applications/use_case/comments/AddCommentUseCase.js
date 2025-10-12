const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

class AddCommentUseCase {
  constructor({
    commentRepository,
    threadRepository,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    if (payload instanceof NewComment === false) {
      throw new Error('ADD_COMMENT_USE_CASE.PAYLOAD_MUST_BE_INSTANCE_OF_NEWCOMMENT');
    }
    const { threadId, owner, content } = payload;

    await this._threadRepository.verifyThreadExists(threadId);
    const addedCommentId = await this._commentRepository.addComment({
      thread_id: threadId,
      owner_id: owner,
      content: content
    });

    return new AddedComment({
      id: addedCommentId,
      content,
      owner
    });
  }
}

module.exports = AddCommentUseCase;