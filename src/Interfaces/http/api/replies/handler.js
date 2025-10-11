const AddReplyUseCase = require('../../../../Applications/use_case/replies/AddReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({ ...request.payload, threadId, commentId, userId: credentialId });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      }
    });

    response.code(201);
    return response;
  }
}

module.exports = RepliesHandler;