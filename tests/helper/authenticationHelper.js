/* istanbul ignore file */
const AuthenticationTokenManager = require('../../src/Applications/security/AuthenticationTokenManager');
const PasswordHash = require('../../src/Applications/security/PasswordHash');
const container = require('../../src/Infrastructures/container');

const createAuthToken = async ({ username = 'johndoe', id = 'user-001' }) => {
  const jwt = container.getInstance(AuthenticationTokenManager.name);

  const accessToken = await jwt.createAccessToken({ username, id });
  const refreshToken = await jwt.createRefreshToken({ username, id });

  return { accessToken, refreshToken };
};

const createHashedPassword = async (password) => {
  const passwordHash = container.getInstance(PasswordHash.name);
  return passwordHash.hash(password);
};

module.exports = {
  createAuthToken,
  createHashedPassword,
};