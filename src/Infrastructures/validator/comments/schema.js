const { customJoi } = require('../customJoi');

const addCommentSchema = customJoi.object({
  content: customJoi.string().label('Isi komentar'),
}).label('Komentar');

module.exports = {
  addCommentSchema,
};