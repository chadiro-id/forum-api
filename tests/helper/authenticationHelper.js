/* istanbul ignore file */
const AuthenticationTokenManager = require('../../src/Applications/security/AuthenticationTokenManager');
const container = require('../../src/Infrastructures/containers/container');

const createAuthToken = async ({ username = 'forumapi', id = 'user-123' }) => {
  const jwt = container.getInstance(AuthenticationTokenManager.name);

  const accessToken = await jwt.createAccessToken({ username, id });
  const refreshToken = await jwt.createRefreshToken({ username, id });

  return { accessToken, refreshToken };
};

module.exports = { createAuthToken };