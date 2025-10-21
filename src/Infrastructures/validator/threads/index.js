const InvariantError = require('../../../Commons/exceptions/InvariantError');
const { addThreadSchema } = require('./schema');

const validatePostThread = (payload) => {
  const result = addThreadSchema.validate(payload);
  if (result.error) {
    throw new InvariantError(result.error.message);
  }
};

module.exports = {
  validatePostThread,
};