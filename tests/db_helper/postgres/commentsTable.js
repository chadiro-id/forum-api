const table = (pool) => {
  const clean = async () => {
    await pool.query('DELETE FROM comments WHERE 1=1');
  };

  return {
    clean,
  };
};

module.exports = table;