const { nanoid } = require('nanoid');
const pool = require('../database/postgres/pool');
const UserRepository = require('../../Domains/users/UserRepository');
const UserRepositoryPostgres = require('../repository/UserRepositoryPostgres');
const AuthenticationRepository = require('../../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('../repository/AuthenticationRepositoryPostgres');

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
};

module.exports = { setup };