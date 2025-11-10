const RegisterUser = require('../../../Domains/users/entities/RegisterUser');

class AddUserUseCase {
  constructor({ userRepository, passwordHash }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
  }

  async execute(payload) {
    const { username, password, fullname } = new RegisterUser(payload);

    const isUsernameExist = await this._userRepository.isUsernameExist(username);
    if (isUsernameExist) {
      throw new Error('ADD_USER_USE_CASE.USERNAME_NOT_AVAILABLE');
    }

    const hashedPassword = await this._passwordHash.hash(password);
    const registerUser = new RegisterUser({
      username,
      password: hashedPassword,
      fullname,
    });

    return this._userRepository.addUser(registerUser);
  }
}

module.exports = AddUserUseCase;
