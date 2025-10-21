const { addCommentSchema } = require('./schema');

const validatePostComment = (payload) => addCommentSchema.validate(payload);

module.exports = {
  validatePostComment,
};