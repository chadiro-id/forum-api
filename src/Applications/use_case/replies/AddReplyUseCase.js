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
    this._verifyPayload(payload);
    const { threadId, commentId, content, userId } = payload;
    await this._threadRepository.verifyThreadExists(threadId);
    await this._commentRepository.verifyCommentExists(commentId);

    const addedReply = await this._replyRepository.addReply({ commentId, content, ownerId: userId });
    return {
      id: addedReply.id,
      content: addedReply.content,
      owner: addedReply.owner,
    };
  }

  _verifyPayload(payload) {
    const { threadId, commentId, content, userId } = payload;

    if (!threadId || !commentId || !content || !userId) {
      throw new Error('ADD_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('ADD_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReplyUseCase;