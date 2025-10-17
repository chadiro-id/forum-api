/* istanbul ignore file */
const comments = (pool) => {
  const add = async ({
    id = 'comment-123',
    threadId = 'thread-123',
    owner = 'user-123',
    content = 'Sebuah komentar',
  }) => {
    const query = {
      text: 'INSERT INTO comments (id, thread_id, owner_id, content) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, threadId, owner, content],
    };

    await pool.query(query);
    return id;
  };

  const findById = async (id) => {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  };

  const clean = async () => {
    await pool.query('DELETE FROM comments WHERE 1=1');
  };

  return {
    add,
    findById,
    clean,
  };
};

module.exports = comments;