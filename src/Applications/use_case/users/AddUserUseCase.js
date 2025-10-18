const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');

class AddUserUseCase {
  constructor({ userRepository, passwordHash }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
  }

  async execute(payload) {
    const entity = new RegisterUser(payload);

    await this._userRepository.verifyAvailableUsername(entity.username);
    entity.password = await this._passwordHash.hash(entity.password);

    const registeredUser = this._userRepository.addUser(entity);
    if (registeredUser instanceof RegisteredUser === false) {
      throw new Error('ADD_USER_USE_CASE.REGISTERED_USER_MUST_BE_INSTANCE_OF_REGISTERED_USER_ENTITY');
    }

    return registeredUser;
  }
}

module.exports = AddUserUseCase;
