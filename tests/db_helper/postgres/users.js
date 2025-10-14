/* istanbul ignore file */
const users = (pool) => {
  const add = async ({
    id = 'user-123',
    username = 'forumapi',
    password = 'supersecret^_^@01',
    fullname = 'Forum Api',
  }) => {
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4)',
      values: [id, username, password, fullname],
    };

    await pool.query(query);
    return id;
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