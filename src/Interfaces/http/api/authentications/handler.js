const AddAuthenticationUseCase = require('../../../../Applications/use_case/authentications/AddAuthenticationUseCase');
const PutAuthenticationUseCase = require('../../../../Applications/use_case/authentications/PutAuthenticationUseCase');
const DeleteAuthenticationUseCase = require('../../../../Applications/use_case/authentications/DeleteAuthenticationUseCase');

class AuthenticationsHandler {
  constructor(container) {
    this._container = container;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    const addAuthenticationUseCase = this._container.getInstance(AddAuthenticationUseCase.name);

    const { accessToken, refreshToken } = await addAuthenticationUseCase.execute(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    const putAuthenticationUseCase = this._container.getInstance(PutAuthenticationUseCase.name);

    const accessToken = await putAuthenticationUseCase.execute(request.payload);
    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    const deleteAuthenticationUseCase = this._container.getInstance(DeleteAuthenticationUseCase.name);

    await deleteAuthenticationUseCase.execute(request.payload);

    return {
      status: 'success',
    };
  }
}

module.exports = AuthenticationsHandler;