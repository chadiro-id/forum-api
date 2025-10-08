const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const PasswordHash = require('../../Applications/security/PasswordHash');
const AddAuthenticationUseCase = require('../../Applications/use_case/authentications/AddAuthenticationUseCase');
const DeleteAuthenticationUseCase = require('../../Applications/use_case/authentications/DeleteAuthenticationUseCase');
const PutAuthenticationUseCase = require('../../Applications/use_case/authentications/PutAuthenticationUseCase');
const AddUserUseCase = require('../../Applications/use_case/users/AddUserUseCase');
const AuthenticationRepository = require('../../Domains/authentications/AuthenticationRepository');
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

  container.register([
    {
      key: AddAuthenticationUseCase.name,
      Class: AddAuthenticationUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'userRepository',
            internal: UserRepository.name,
          },
          {
            name: 'authenticationRepository',
            internal: AuthenticationRepository.name,
          },
          {
            name: 'authenticationTokenManager',
            internal: AuthenticationTokenManager.name,
          },
          {
            name: 'passwordHash',
            internal: PasswordHash.name,
          },
        ],
      },
    },
    {
      key: PutAuthenticationUseCase.name,
      Class: PutAuthenticationUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'authenticationRepository',
            internal: AuthenticationRepository.name,
          },
          {
            name: 'authenticationTokenManager',
            internal: AuthenticationTokenManager.name,
          },
        ],
      },
    },
    {
      key: DeleteAuthenticationUseCase.name,
      Class: DeleteAuthenticationUseCase,
      parameter: {
        injectType: 'destructuring',
        dependencies: [
          {
            name: 'authenticationRepository',
            internal: AuthenticationRepository.name,
          },
        ],
      },
    },
  ]);
};

module.exports = { setup };