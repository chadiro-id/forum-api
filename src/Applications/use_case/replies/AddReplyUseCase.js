const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../Domains/replies/entities/NewReply');

class AddReplyUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(payload) {
    const newReply = new NewReply(payload);

    await this._threadRepository.verifyThreadExists(payload.threadId);
    await this._commentRepository.verifyCommentBelongToThread(newReply.commentId, payload.threadId);

    const addedReply = await this._replyRepository.addReply(newReply);
    if (addedReply instanceof AddedReply === false) {
      throw new Error('ADD_REPLY_USE_CASE.ADDED_REPLY_MUST_BE_INSTANCE_OF_ADDED_REPLY_ENTITY');
    }

    return addedReply;
  }
}

module.exports = AddReplyUseCase;