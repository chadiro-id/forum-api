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

module.exports = {
  createRawThread,
};