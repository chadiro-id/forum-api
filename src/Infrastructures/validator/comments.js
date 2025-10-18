const InvariantError = require('../../Commons/exceptions/InvariantError');

const validatePostCommentPayload = (payload) => {
  const { content } = payload;

  if (!content) {
    throw new InvariantError('Komentar wajib diisi');
  }

  if (typeof content !== 'string') {
    throw new InvariantError('Komentar harus string');
  }
};

module.exports = {
  validatePostCommentPayload,
};