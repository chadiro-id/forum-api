/* istanbul ignore file */

const createRawThread = (overrides = {}) => {
  const timestamp = new Date();
  const defaultThread = {
    id: 'thread-123',
    title: 'Sebuah thread',
    body: 'Isi thread',
    username: 'johndoe',
    created_at: timestamp,
  };

  return { ...defaultThread, ...overrides };
};

const createRawComment = (overrides = {}) => {
  const timestamp = new Date();
  const defaultComment = {
    id: 'comment-001',
    content: 'Sebuah komentar',
    username: 'johndoe',
    created_at: timestamp,
    is_delete: false,
  };

  return { ...defaultComment, ...overrides };
};

const createRawReply = (overrides = {}) => {
  const timestamp = new Date();
  const defaultReply = {
    id: 'reply-001',
    comment_id: 'comment-001',
    content: 'Sebuah balasan',
    username: 'johndoe',
    created_at: timestamp,
    is_delete: false,
  };

  return { ...defaultReply, ...overrides };
};

module.exports = {
  createRawThread,
  createRawComment,
  createRawReply,
};