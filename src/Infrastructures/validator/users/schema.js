const Joi = require('joi');
const customJoi = require('../customJoi');

const registerUserSchema = Joi.object({
  username: Joi.string().required().max(50).pattern(/^[\w]+$/).messages({
    'string.base': 'username harus berupa string',
    'any.required': 'username wajib diisi',
    'string.empty': 'username tidak boleh kosong',
    'string.max': 'username maksimal {#limit} karakter',
    'string.pattern.base': 'tidak dapat membuat user baru karena username mengandung karakter terlarang',
  }),
  password: customJoi.string().required().label('password'),
  fullname: customJoi.string().required().label('fullname'),
});

module.exports = {
  registerUserSchema,
};