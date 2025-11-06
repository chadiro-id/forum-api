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
    const newComment = new NewComment(payload);

    const isThreadExist = await this._threadRepository.isThreadExist(newComment.threadId);
    if (!isThreadExist) {
      throw new Error('ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND');
    }

    const addedComment = await this._commentRepository.addComment(newComment);

    if (addedComment instanceof AddedComment === false) {
      throw new Error('ADD_COMMENT_USE_CASE.ADDED_COMMENT_MUST_BE_INSTANCE_OF_ADDED_COMMENT_ENTITY');
    }

    return addedComment;
  }
}

module.exports = AddCommentUseCase;