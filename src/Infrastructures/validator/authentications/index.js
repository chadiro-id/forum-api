const InvariantError = require('../../../Commons/exceptions/InvariantError');
const { loginUserSchema, refreshTokenSchema } = require('./schema');

const validatePostAuthentication = (payload) => {
  const result = loginUserSchema.validate(payload);
  if (result.error) {
    throw new InvariantError(result.error.message);
  }
};

const validateRefreshToken = (payload) => {
  const result = refreshTokenSchema.validate(payload);
  if (result.error) {
    throw new InvariantError(result.error.message);
  }
};

module.exports = {
  validatePostAuthentication,
  validatePutAuthentication: validateRefreshToken,
  validateDeleteAuthentication: validateRefreshToken,
};