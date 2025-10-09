const { nanoid } = require('nanoid');
const pool = require('../database/postgres/pool');
const UserRepository = require('../../Domains/users/UserRepository');
const UserRepositoryPostgres = require('../repository/UserRepositoryPostgres');
const AuthenticationRepository = require('../../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('../repository/AuthenticationRepositoryPostgres');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('../repository/ThreadRepositoryPostgres');

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
    {
      key: ThreadRepository.name,
      Class: ThreadRepositoryPostgres,
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
  ]);
};

module.exports = { setup };