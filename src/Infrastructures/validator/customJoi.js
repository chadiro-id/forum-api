const Joi = require('joi');

module.exports = Joi.defaults((schema) => {
  return schema.messages({
    'string.base': '{{#label}} harus berupa teks',
    'string.empty': '{{#label}} tidak boleh kosong',
    'string.min': '{{#label}} minimal {#limit} karakter',
    'string.max': '{{#label}} maksimal {#limit} karakter',
    'string.pattern.base': 'Format {{#label}} tidak valid',
    'number.base': '{{#label}} harus berupa angka',
    'number.min': '{{#label}} minimal {#limit}',
    'number.max': '{{#label}} maksimal {#limit}',
    'any.required': '{{#label}} wajib diisi',
    'any.only': '{{#label}} harus salah satu dari: {#valids}'
  });
});