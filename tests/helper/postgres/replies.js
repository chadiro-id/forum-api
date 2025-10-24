/* istanbul ignore file */
const replies = (pool) => {
  const add = async ({
    id = 'reply-001',
    comment_id = 'comment-001',
    owner_id = 'user-001',
    content = 'Sebuah balasan',
    is_delete = false,
  }) => {
    const query = {
      text: `
      INSERT INTO replies
        (id, comment_id, owner_id, content, is_delete)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        id, content, created_at
      `,
      values: [id, comment_id, owner_id, content, is_delete],
    };

    const result = await pool.query(query);
    return result.rows[0];
  };

  const findById = async (id) => {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  };

  const softDeleteById = async (id) => {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  };

  const clean = async () => {
    await pool.query('DELETE FROM replies WHERE 1=1');
  };

  return {
    add,
    findById,
    softDeleteById,
    clean,
  };
};

module.exports = replies;