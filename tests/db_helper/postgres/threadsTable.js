/* istanbul ignore file */
const tableHelper = (pool) => {

  const clean = async () => {
    await pool.query('DELETE FROM threads WHERE 1=1');
  };

  return {
    clean,
  };
};

module.exports = tableHelper;