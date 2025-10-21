const { customJoi } = require('../customJoi');

const addCommentSchema = customJoi.object({
  content: customJoi.string(),
}).label('Komentar');

module.exports = {
  addCommentSchema,
};