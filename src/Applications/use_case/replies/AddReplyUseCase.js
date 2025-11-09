const AddedReply = require('../../../Domains/replies/entities/AddedReply');
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
    const { threadId, commentId } = payload;

    const isCommentExist = await this._commentRepository.isCommentExist(commentId, threadId);
    if (!isCommentExist) {
      throw new Error('ADD_REPLY_USE_CASE.COMMENT_NOT_FOUND');
    }

    const addedReply = await this._replyRepository.addReply(newReply);
    if (addedReply instanceof AddedReply === false) {
      throw new Error('ADD_REPLY_USE_CASE.ADDED_REPLY_MUST_BE_INSTANCE_OF_ADDED_REPLY_ENTITY');
    }

    return addedReply;
  }
}

module.exports = AddReplyUseCase;