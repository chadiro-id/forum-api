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

    return this._userRepository.addUser(entity);
  }
}

module.exports = AddUserUseCase;
