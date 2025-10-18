const AddCommentUseCase = require('../../../../Applications/use_case/comments/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/comments/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container, validator) {
    this._container = container;
    this._validator = validator;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    this._validator.validatePostCommentPayload(request.payload);

    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;

    const useCase = this._container.getInstance(AddCommentUseCase.name);
    const addedComment = await useCase.execute({ threadId, owner, content });

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
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const useCase = this._container.getInstance(DeleteCommentUseCase.name);

    await useCase.execute({ threadId, commentId, owner });

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;