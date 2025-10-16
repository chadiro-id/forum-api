const AddReplyUseCase = require('../../../../Applications/use_case/replies/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/replies/DeleteReplyUseCase');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;

    const { content } = request.payload;
    if (!content || typeof content !== 'string') {
      throw new InvariantError('Balasan harus di isi dengan benar');
    }

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
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    const useCase = this._container.getInstance(DeleteReplyUseCase.name);
    await useCase.execute({ threadId, commentId, replyId, userId });

    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;