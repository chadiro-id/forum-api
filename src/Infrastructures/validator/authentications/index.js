const InvariantError = require('../../../Commons/exceptions/InvariantError');
const { loginUserSchema, refreshTokenSchema } = require('./schema');

const validateLoginUser = (payload) => {
  const result = loginUserSchema.validate(payload);
  if (result.error) {
    throw new InvariantError(result.error.message);
  }
};

const validateAuthentication = (payload) => {
  const result = refreshTokenSchema.validate(payload);
  if (result.error) {
    throw new InvariantError(result.error.message);
  }
};

module.exports = {
  validateLoginUser,
  validateAuthentication,
};