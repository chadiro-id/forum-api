const customJoi = require('../customJoi');

const addCommentSchema = customJoi.object({
  content: customJoi.string().required().label('Isi komentar'),
});

module.exports = {
  addCommentSchema,
};