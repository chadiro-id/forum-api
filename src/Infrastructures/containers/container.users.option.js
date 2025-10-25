const { nanoid } = require('nanoid');
const pool = require('../database/postgres/pool');
const UserRepository = require('../../Domains/users/UserRepository');
const UserRepositoryPostgres = require('../repository/UserRepositoryPostgres');
const PasswordHash = require('../../Applications/security/PasswordHash');
const AddUserUseCase = require('../../Applications/use_case/users/AddUserUseCase');

const setup = (container) => {
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
          }
        ]
      }
    },
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