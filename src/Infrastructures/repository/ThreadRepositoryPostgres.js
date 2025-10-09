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
}

module.exports = ThreadRepositoryPostgres;