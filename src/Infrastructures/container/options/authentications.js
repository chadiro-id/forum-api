const pool = require('../../database/postgres/pool');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('../../repository/AuthenticationRepositoryPostgres');
const AddAuthenticationUseCase = require('../../../Applications/use_case/authentications/AddAuthenticationUseCase');
const PutAuthenticationUseCase = require('../../../Applications/use_case/authentications/PutAuthenticationUseCase');
const DeleteAuthenticationUseCase = require('../../../Applications/use_case/authentications/DeleteAuthenticationUseCase');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationTokenManager = require('../../../Applications/security/AuthenticationTokenManager');
const PasswordHash = require('../../../Applications/security/PasswordHash');

const options = [
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },
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
        }
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
];

module.exports = options;