const createRawThread = (overrides = {}) => {
  const date = new Date(Date.now());
  const defaultThread = {
    id: 'thread-123',
    title: 'Sebuah thread',
    body: 'Isi thread',
    username: 'johndoe',
    created_at: date,
  };

  return { ...defaultThread, ...overrides };
};

const createRawComment = (overrides = {}) => {
  const date = new Date(Date.now());
  const defaultComment = {
    id: 'comment-001',
    content: 'Sebuah komentar',
    username: 'johndoe',
    created_at: date,
    is_delete: false,
  };

  return { ...defaultComment, ...overrides };
};

const createRawReply = (overrides = {}) => {
  const date = new Date(Date.now());
  const defaultReply = {
    id: 'reply-001',
    comment_id: 'comment-001',
    content: 'Sebuah balasan',
    username: 'johndoe',
    created_at: date,
    is_delete: false,
  };

  return { ...defaultReply, ...overrides };
};

module.exports = {
  createRawThread,
  createRawComment,
  createRawReply,
};