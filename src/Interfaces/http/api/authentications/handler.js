const AddAuthenticationUseCase = require('../../../../Applications/use_case/authentications/AddAuthenticationUseCase');
const PutAuthenticationUseCase = require('../../../../Applications/use_case/authentications/PutAuthenticationUseCase');
const DeleteAuthenticationUseCase = require('../../../../Applications/use_case/authentications/DeleteAuthenticationUseCase');

class AuthenticationsHandler {
  constructor(container, validator) {
    this._container = container;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthentication(request.payload);
    const useCase = this._container.getInstance(AddAuthenticationUseCase.name);

    const { accessToken, refreshToken } = await useCase.execute(request.payload);

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
    this._validator.validatePutAuthentication(request.payload);
    const useCase = this._container.getInstance(PutAuthenticationUseCase.name);

    const accessToken = await useCase.execute(request.payload);
    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    this._validator.validateDeleteAuthentication(request.payload);
    const useCase = this._container.getInstance(DeleteAuthenticationUseCase.name);

    await useCase.execute(request.payload);

    return {
      status: 'success',
    };
  }
}

module.exports = AuthenticationsHandler;