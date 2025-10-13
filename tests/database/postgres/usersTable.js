/* istanbul ignore file */
class UsersTable {
  constructor(pool) {
    this._pool = pool;
  }
  async addUser({
    id = 'user-123', username = 'forumapi', password = 'supersecret^_^@01', fullname = 'Forum Api',
  }) {
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4)',
      values: [id, username, password, fullname],
    };

    await this._pool.query(query);
  }

  async findUsersById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async cleanTable() {
    await this._pool.query('DELETE FROM users WHERE 1=1');
  }
};

module.exports = UsersTable;