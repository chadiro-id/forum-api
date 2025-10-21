const InvariantError = require('../../../Commons/exceptions/InvariantError');
const { addReplySchema } = require('./schema');

const validatePostReply = (payload) => {
  const result = addReplySchema.validate(payload);
  if (result.error) {
    throw new InvariantError(result.error.message);
  }
};

module.exports = {
  validatePostReply,
};