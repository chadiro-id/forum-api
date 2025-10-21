const customJoi = require('../customJoi');

const addReplySchema = customJoi.object({
  content: customJoi.string().label('Isi balasan'),
}).label('Balasan');

module.exports = {
  addReplySchema,
};