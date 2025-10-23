/* istanbul ignore file */
const comments = (pool) => {
  const add = async ({
    id = 'comment-001',
    threadId = 'thread-001',
    owner = 'user-001',
    content = 'Sebuah komentar',
  }) => {
    const query = {
      text: 'INSERT INTO comments (id, thread_id, owner_id, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      values: [id, threadId, owner, content],
    };

    const result = await pool.query(query);
    return result.rows[0];
  };

  const findById = async (id) => {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
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