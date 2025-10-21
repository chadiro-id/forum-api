const InvariantError = require('../../../Commons/exceptions/InvariantError');
const { registerUserSchema } = require('./schema');

const validatePostUser = (payload) => {
  const result = registerUserSchema.validate(payload);
  if (result.error) {
    throw new InvariantError(result.error.message);
  }
};

module.exports = {
  validatePostUser,
};