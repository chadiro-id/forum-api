const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThreadEntity = require('../../Domains/threads/entities/AddedThreadEntity');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool,
    this._idGenerator = idGenerator;
  }

  async addThread(entity) {
    const { title, body, userId } = entity;

    const id = `thread-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO threads (id, title, body, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, title, owner_id',
      values: [id, title, body, userId]
    };

    const result = await this._pool.query(query);

    return new AddedThreadEntity({
      ...result.rows[0],
      owner: result.rows[0].id,
    });
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

  async getDetailThread(id) {
    const query = {
      text: `
      SELECT t.id, t.title, t.body, t.created_at, u.username
      FROM threads t
      LEFT JOIN users u
      ON u.id = t.owner_id
      WHERE t.id = $1`,
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