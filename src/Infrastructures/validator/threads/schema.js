const customJoi = require('../customJoi');

const addThreadSchema = customJoi.object({
  title: customJoi.string().required().max(255).label('Judul thread'),
  body: customJoi.string().required().label('Bodi thread'),
});

module.exports = {
  addThreadSchema,
};