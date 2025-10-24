/* istanbul ignore file */
const comments = (pool) => {
  const add = async ({
    id = 'comment-001',
    thread_id = 'thread-001',
    owner_id = 'user-001',
    content = 'Sebuah komentar',
    is_delete = false,
  }) => {
    const query = {
      text: `
      INSERT INTO comments
        (id, thread_id, owner_id, content, is_delete)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING id, content, created_at
      `,
      values: [id, thread_id, owner_id, content, is_delete],
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