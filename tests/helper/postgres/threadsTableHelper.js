/* istanbul ignore file */
const helper = (pool) => {
  async function add({
    id = 'thread-001',
    title = 'Sebuah thread',
    body = 'Isi thread',
    owner_id = 'user-001'
  }) {
    const query = {
      text: 'INSERT INTO threads (id, title, body, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      values: [id, title, body, owner_id]
    };

    const result = await pool.query(query);
    return result.rows[0];
  };

  async function findById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  };

  async function clean() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  };

  return {
    add,
    findById,
    clean,
  };
};

module.exports = helper;