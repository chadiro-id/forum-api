const InvariantError = require('../../Commons/exceptions/InvariantError');

const validateRegisterUserPayload = (payload) => {
  const { username, password, fullname } = payload;

  if (!username || !password || !fullname) {
    throw new InvariantError('tidak dapat membuat user baru, data tidak lengkap');
  }

  if (
    typeof username !== 'string'
    || typeof password !== 'string'
    || typeof fullname !== 'string'
  ) {
    throw new InvariantError('tidak dapat membuat user baru, tipe data tidak sesuai');
  }

  if (username.length > 50) {
    throw new InvariantError('tidak dapat membuat user baru, username maksimal 50 karakter');
  }

  if (!username.match(/^[\w]+$/)) {
    throw new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang');
  }
};

module.exports = {
  validateRegisterUserPayload,
};