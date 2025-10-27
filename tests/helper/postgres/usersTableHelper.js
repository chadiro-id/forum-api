/* istanbul ignore file */
const users = (pool) => {
  const add = async ({
    id = 'user-001',
    username = 'johndoe',
    password = 'supersecret^_^@01',
    fullname = 'John Doe',
  }) => {
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id, username',
      values: [id, username, password, fullname],
    };

    const result = await pool.query(query);
    return result.rows[0];
  };

  const findById = async (id) => {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  };

  const clean = async () => {
    await pool.query('DELETE FROM users WHERE 1=1');
  };

  return {
    add, findById, clean
  };
};

module.exports = users;