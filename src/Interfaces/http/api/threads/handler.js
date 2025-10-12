const AddThreadUseCase = require('../../../../Applications/use_case/threads/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/threads/GetDetailThreadUseCase');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');
const NewThread = require('../../../../Domains/threads/entities/NewThread');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    this._validatePayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { title, body } = request.payload;

    const newThread = new NewThread({
      title, body, owner: credentialId
    });

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(newThread);

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

  _validatePayload(payload) {
    const { title, body } = payload;

    if (!title || !body) {
      throw new InvariantError('Judul dan isi wajib di isi');
    }

    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new InvariantError('Judul dan isi harus berupa string');
    }
  }
}

module.exports = ThreadsHandler;