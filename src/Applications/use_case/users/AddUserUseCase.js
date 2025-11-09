const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');

class AddUserUseCase {
  constructor({ userRepository, passwordHash }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
  }

  async execute(payload) {
    const registerPayload = new RegisterUser(payload);

    const isUsernameExist = await this._userRepository.isUsernameExist(registerPayload.username);
    if (isUsernameExist) {
      throw new Error('ADD_USER_USE_CASE.USERNAME_NOT_AVAILABLE');
    }

    const hashedPassword = await this._passwordHash.hash(registerPayload.password);
    const registerUser = new RegisterUser({
      ...registerPayload,
      password: hashedPassword,
    });

    const registeredUser = await this._userRepository.addUser(registerUser);
    if (registeredUser instanceof RegisteredUser === false) {
      throw new Error('ADD_USER_USE_CASE.REGISTERED_USER_MUST_BE_INSTANCE_OF_REGISTERED_USER_ENTITY');
    }

    return registeredUser;
  }
}

module.exports = AddUserUseCase;
