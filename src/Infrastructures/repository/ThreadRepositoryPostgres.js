const AddedThreadMapper = require('../../Commons/utils/AddedThreadMapper');
const ThreadDetailsMapper = require('../../Commons/utils/ThreadDetailsMapper');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool,
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;

    const id = `thread-${this._idGenerator()}`;
    const timestamp = new Date();

    const query = {
      text: `
      INSERT INTO threads
        (id, title, body, owner_id, created_at)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING
        id, title, owner_id
      `,
      values: [id, title, body, owner, timestamp]
    };

    const result = await this._pool.query(query);
    return AddedThreadMapper.toEntity(result.rows[0]);
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
      return null;
    }

    return ThreadDetailsMapper.toEntity(result.rows[0]);
  }

  async isThreadExist(id) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }
}

module.exports = ThreadRepositoryPostgres;