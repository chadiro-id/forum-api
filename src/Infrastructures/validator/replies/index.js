const { addReplySchema } = require('./schema');

const validatePostReply = (payload) => addReplySchema.validate(payload);

module.exports = {
  validatePostReply,
};