/* istanbul ignore file */
const helper = (pool) => {
  async function addToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1) RETURNING token',
      values: [token],
    };

    const result = await pool.query(query);
    return result.rows[0].token;
  };

  async function findToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await pool.query(query);

    return result.rows;
  };

  async function clean() {
    await pool.query('DELETE FROM authentications WHERE 1=1');
  };

  return {
    addToken, findToken, clean,
  };
};

module.exports = helper;
