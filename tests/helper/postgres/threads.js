/* istanbul ignore file */
const threads = (pool) => {
  const add = async ({
    id = 'thread-001',
    title = 'Sebuah thread',
    body = 'Isi thread',
    owner = 'user-001'
  }) => {
    const query = {
      text: 'INSERT INTO threads (id, title, body, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
      values: [id, title, body, owner]
    };

    const result = await pool.query(query);
    return result.rows[0];
  };

  const findById = async (id) => {
    const query = {
      text: `
      SELECT
        t.id, t.title, t.body, t.created_at, u.username
      FROM
        threads t
      LEFT JOIN
        users u
      ON
        u.id = t.owner_id
      WHERE
        t.id = $1
      `,
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  };

  const clean = async () => {
    await pool.query('DELETE FROM threads WHERE 1=1');
  };

  return {
    add,
    findById,
    clean,
  };
};

module.exports = threads;