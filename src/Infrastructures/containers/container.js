/* istanbul ignore file */
const { createContainer } = require('instances-container');

const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');

const PasswordHash = require('../../Applications/security/PasswordHash');
const BcryptPasswordHash = require('../security/BcryptPasswordHash');
const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const JwtTokenManager = require('../security/JwtTokenManager');

const repositoryContainer = require('./repositoryContainer');
const useCaseContainer = require('./useCaseContainer');

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

repositoryContainer.setup(container);
useCaseContainer.setup(container);

module.exports = container;