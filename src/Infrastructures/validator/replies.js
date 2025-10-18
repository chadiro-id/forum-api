const InvariantError = require('../../Commons/exceptions/InvariantError');

const validatePostReplyPayload = (payload) => {
  const { content } = payload;

  if (!content) {
    throw new InvariantError('Balasan wajib diisi');
  }

  if (typeof content !== 'string') {
    throw new InvariantError('Balasan harus string');
  }
};

module.exports = {
  validatePostReplyPayload,
};