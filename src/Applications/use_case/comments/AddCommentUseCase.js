const AddCommentEntity = require('../../../Domains/comments/entities/AddCommentEntity');

class AddCommentUseCase {
  constructor({
    commentRepository,
    threadRepository,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    const { userId, threadId, content } = payload;
    const newComment = new AddCommentEntity({
      threadId, content, owner: userId,
    });

    await this._threadRepository.verifyThreadExists(threadId);
    const addedComment = await this._commentRepository.addComment(newComment);

    return addedComment;
  }
}

module.exports = AddCommentUseCase;