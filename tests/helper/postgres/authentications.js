/* istanbul ignore file */
const authentications = (pool) => {
  const addToken = async (token) => {
    const query = {
      text: 'INSERT INTO authentications VALUES($1) RETURNING token',
      values: [token],
    };

    const result = await pool.query(query);
    return result.rows[0].token;
  };

  const findToken = async (token) => {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await pool.query(query);

    return result.rows;
  };

  const clean = async () => {
    await pool.query('DELETE FROM authentications WHERE 1=1');
  };

  return {
    addToken, findToken, clean,
  };
};

module.exports = authentications;
