const InvariantError = require('../../../Commons/exceptions/InvariantError');
const { addCommentSchema } = require('./schema');

const validatePostComment = (payload) => {
  const result = addCommentSchema.validate(payload);
  if (result.error) {
    throw new InvariantError(result.error.message);
  }
};

module.exports = {
  validatePostComment,
};