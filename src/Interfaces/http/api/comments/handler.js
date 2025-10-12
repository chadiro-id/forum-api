const AddCommentUseCase = require('../../../../Applications/use_case/comments/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/comments/DeleteCommentUseCase');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');
const NewComment = require('../../../../Domains/comments/entities/NewComment');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;

    const { content } = request.payload;

    if (!content || typeof content !== 'string') {
      throw new InvariantError('Komentar harus di isi dengan benar');
    }

    const newComment = new NewComment({
      threadId, owner, content
    });

    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await addCommentUseCase.execute(newComment);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCommentHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const useCase = this._container.getInstance(DeleteCommentUseCase.name);

    await useCase.execute({ threadId, commentId, credentialId });

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;