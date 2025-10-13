/* istanbul ignore file */
class AuthenticationsTable {
  constructor(pool) {
    this._pool = pool;
  }

  async addToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this._pool.query(query);
  }

  async findToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async cleanTable() {
    await this._pool.query('DELETE FROM authentications WHERE 1=1');
  }
}

module.exports = AuthenticationsTable;
