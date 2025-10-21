const customJoi = require('../customJoi');

const addReplySchema = customJoi.object({
  content: customJoi.string().required().label('Isi balasan'),
});

module.exports = {
  addReplySchema,
};