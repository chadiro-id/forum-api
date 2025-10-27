/* istanbul ignore file */
const helper = (pool) => {
  async function add({
    id = 'user-001',
    username = 'johndoe',
    password = 'supersecret^_^@01',
    fullname = 'John Doe',
  }) {
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id, username',
      values: [id, username, password, fullname],
    };

    const result = await pool.query(query);
    return result.rows[0];
  };

  async function findById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  };

  async function clean() {
    await pool.query('DELETE FROM users WHERE 1=1');
  };

  return {
    add, findById, clean
  };
};

module.exports = helper;