/* istanbul ignore file */
const { createContainer } = require('instances-container');

const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const pool = require('../database/postgres/pool');

const PasswordHash = require('../../Applications/security/PasswordHash');
const BcryptPasswordHash = require('../security/BcryptPasswordHash');
const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const JwtTokenManager = require('../security/JwtTokenManager');

const UserRepository = require('../../Domains/users/UserRepository');
const UserRepositoryPostgres = require('../repository/UserRepositoryPostgres');
const AuthenticationRepository = require('../../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('../repository/AuthenticationRepositoryPostgres');

const UsersUseCase = require('../../Applications/use_case/UsersUseCase');
const AuthenticationsUseCase = require('../../Applications/use_case/AuthenticationsUseCase');

const container = createContainer();

container.register([
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },
  {
    key: AuthenticationTokenManager.name,
    Class: JwtTokenManager,
    parameter: {
      dependencies: [
        {
          concrete: Jwt.token,
        },
      ],
    },
  },
]);

container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
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
]);

container.register([
  {
    key: UsersUseCase.name,
    Class: UsersUseCase,
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
  {
    key: AuthenticationsUseCase.name,
    Class: AuthenticationsUseCase,
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
]);

module.exports = container;