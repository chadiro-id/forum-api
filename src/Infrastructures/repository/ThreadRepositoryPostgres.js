const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
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

    const query = {
      text: `
      INSERT INTO threads
        (id, title, body, owner_id)
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id, title, owner_id
      `,
      values: [id, title, body, owner]
    };

    const result = await this._pool.query(query);

    return this._transformToAddedThread(result.rows[0]);
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

    return this._transformToDetailThread(result.rows[0]);
  }

  _transformToAddedThread({
    id, title, owner_id: owner
  }) {
    return new AddedThread({
      id, title, owner
    });
  }

  _transformToDetailThread({
    id, title, body, username, created_at: date,
  }) {
    return new DetailThread({
      id, title, body, username, date
    });
  }
}

module.exports = ThreadRepositoryPostgres;