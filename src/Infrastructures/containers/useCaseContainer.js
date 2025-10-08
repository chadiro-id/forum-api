const PasswordHash = require('../../Applications/security/PasswordHash');
const AddUserUseCase = require('../../Applications/use_case/users/AddUserUseCase');
const UserRepository = require('../../Domains/users/UserRepository');

const setup = (container) => {
  container.register([
    {
      key: AddUserUseCase.name,
      Class: AddUserUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'userRepository',
            internal: UserRepository.name,
          },
          {
            name: 'passwordHash',
            internal: PasswordHash.name,
          },
        ],
      },
    },
  ]);
};

module.exports = { setup };