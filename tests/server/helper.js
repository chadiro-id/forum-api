/* istanbul ignore file */
const AuthenticationTokenManager = require('../../src/Applications/security/AuthenticationTokenManager');
const container = require('../../src/Infrastructures/containers/container');
const { authenticationsTable } = require('../db_helper/postgres');

const getUserAuth = async ({ username = 'forumapi', id = 'user-123' }) => {
  const jwt = container.getInstance(AuthenticationTokenManager.name);

  const accessToken = await jwt.createAccessToken({ username, id });
  const refreshToken = await jwt.createAccessToken({ username, id });

  authenticationsTable.addToken(refreshToken);
  return accessToken;
};

module.exports = { getUserAuth };