const InvariantError = require('../../Commons/exceptions/InvariantError');

const validatePostThreadPayload = (payload) => {
  const { title, body } = payload;

  if (!title || !body) {
    throw new InvariantError('Judul dan isi wajib di isi');
  }

  if (
    typeof title !== 'string'
    || typeof body !== 'string'
  ) {
    throw new InvariantError('Judul dan isi harus berupa text');
  }

  if (title.length > 255) {
    throw new InvariantError('Panjang judul maksimal 255 karakter');
  }
};

module.exports = {
  validatePostThreadPayload,
};