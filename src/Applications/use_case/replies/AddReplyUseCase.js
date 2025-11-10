const NewReply = require('../../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({
    commentRepository,
    replyRepository,
  }) {
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    const newReply = new NewReply(payload);
    const { threadId, commentId } = newReply;

    const isCommentExist = await this._commentRepository.isCommentExist(commentId, threadId);
    if (!isCommentExist) {
      throw new Error('ADD_REPLY_USE_CASE.COMMENT_NOT_FOUND');
    }

    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddReplyUseCase;