const InvariantError = require('../../Commons/exceptions/InvariantError');

const validateUserLoginPayload = (payload) => {
  const { username, password } = payload;

  if (!username || !password) {
    throw new InvariantError('harus mengirimkan username dan password');
  }

  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new InvariantError('username dan password harus string');
  }
};

const validatePutAuthenticationPayload = (payload) => verifyRefreshToken(payload.refreshToken);
const validateDeleteAuthenticationPayload = (payload) => verifyRefreshToken(payload.refreshToken);

function verifyRefreshToken(token) {
  if (!token) {
    throw new InvariantError('harus mengirimkan token refresh');
  }

  if (typeof token !== 'string') {
    throw new InvariantError('refresh token harus string');
  }
}

module.exports = {
  validateUserLoginPayload,
  validatePutAuthenticationPayload,
  validateDeleteAuthenticationPayload
};