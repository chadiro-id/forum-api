const AddThreadUseCase = require('../../../../Applications/use_case/threads/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/threads/GetDetailThreadUseCase');

class ThreadsHandler {
  constructor(container, validator) {
    this._container = container;
    this._validator = validator;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    this._validator.validatePostThreadPayload(request.payload);

    const { id: owner } = request.auth.credentials;
    const { title, body } = request.payload;

    const useCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await useCase.execute({ title, body, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });

    response.code(201);
    return response;
  }

  async getThreadHandler(request, h) {
    const { threadId } = request.params;

    const useCase = this._container.getInstance(GetDetailThreadUseCase.name);
    const thread = await useCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });

    return response;
  }
}

module.exports = ThreadsHandler;