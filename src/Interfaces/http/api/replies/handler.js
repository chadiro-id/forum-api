const AddReplyUseCase = require('../../../../Applications/use_case/replies/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/replies/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container, validator) {
    this._container = container;
    this._validator = validator;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    this._validator.validatePostReply(request.payload);

    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const { content } = request.payload;

    const useCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await useCase.execute({ threadId, commentId, owner, content });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      }
    });

    response.code(201);
    return response;
  }

  async deleteReplyHandler(request) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    const useCase = this._container.getInstance(DeleteReplyUseCase.name);
    await useCase.execute({ threadId, commentId, replyId, owner });

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;