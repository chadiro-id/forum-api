const AddUserUseCase = require('../../../../Applications/use_case/users/AddUserUseCase');

class UsersHandler {
  constructor(container, validator) {
    this._container = container;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateRegisterUserPayload(request.payload);
    const useCase = this._container.getInstance(AddUserUseCase.name);

    const addedUser = await useCase.execute(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedUser,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
