const UsersUseCase = require('../../../../Applications/use_case/AddUserUseCase');

class UsersHandler {
  constructor(container) {
    this._container = container;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    const useCase = this._container.getInstance(UsersUseCase.name);
    const addedUser = await useCase.addUser(request.payload);

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
