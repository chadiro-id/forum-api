/* istanbul ignore file */
const replies = (pool) => {
  const add = async ({
    id = 'reply-123',
    commentId = 'comment-123',
    owner = 'user-123',
    content = 'Sebuah balasan',
  }) => {
    const query = {
      text: 'INSERT INTO replies (id, comment_id, owner_id, content) VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, commentId, owner, content],
    };

    await pool.query(query);
    return id;
  };

  const clean = async () => {
    await pool.query('DELETE FROM replies WHERE 1=1');
  };

  return {
    add,
    clean,
  };
};

module.exports = replies;