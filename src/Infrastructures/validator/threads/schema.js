const customJoi = require('../customJoi');

const addThreadSchema = customJoi.object({
  title: customJoi.string().max(255).label('Judul'),
  body: customJoi.string().label('Bodi'),
}).label('Thread');

module.exports = {
  addThreadSchema,
};