const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool,
    this._idGenerator = idGenerator;
  }

  async addThread(record) {
    const { title, body, owner_id } = record;

    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: `
      INSERT INTO
        threads
        (id, title, body, owner_id)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id, title, owner_id
      `,
      values: [id, title, body, owner_id]
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async verifyThreadExists(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Thread tidak ada, id tidak ditemukan');
    }
  }

  async getThreadById(id) {
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

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Thread tidak ada, id tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;