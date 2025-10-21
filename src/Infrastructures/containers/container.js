const { createContainer } = require('instances-container');

const config = require('../../Commons/config');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');

const PasswordHash = require('../../Applications/security/PasswordHash');
const BcryptPasswordHash = require('../security/BcryptPasswordHash');
const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const JwtTokenManager = require('../security/JwtTokenManager');

const usersContainer = require('./users.container');
const authenticationsContainer = require('./authentications.container');
const threadsContainer = require('./threads.container');
const commentsContainer = require('./comments.container');
const repliesContainer = require('./replies.container');

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
        {
          concrete: config.tokenize.accessTokenKey,
        },
        {
          concrete: config.tokenize.refreshTokenKey,
        },
      ],
    },
  },
]);

usersContainer.setup(container);
authenticationsContainer.setup(container);
threadsContainer.setup(container);
commentsContainer.setup(container);
repliesContainer.setup(container);

module.exports = container;