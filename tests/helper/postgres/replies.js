/* istanbul ignore file */
const replies = (pool) => {
  const add = async ({
    id = 'reply-123',
    commentId = 'comment-123',
    owner = 'user-123',
    content = 'Sebuah balasan',
  }) => {
    const query = {
      text: 'INSERT INTO replies (id, comment_id, owner_id, content) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      values: [id, commentId, owner, content],
    };

    const result = await pool.query(query);
    return result.rows[0];
  };

  const findById = async (id) => {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  };

  const clean = async () => {
    await pool.query('DELETE FROM replies WHERE 1=1');
  };

  return {
    add,
    findById,
    clean,
  };
};

module.exports = replies;