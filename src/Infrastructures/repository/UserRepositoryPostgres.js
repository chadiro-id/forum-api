const RegisteredUser = require('../../Domains/users/entities/RegisteredUser');
const UserId = require('../../Domains/users/entities/UserId');
const UserPassword = require('../../Domains/users/entities/UserPassword');
const UserRepository = require('../../Domains/users/UserRepository');

class UserRepositoryPostgres extends UserRepository {
  constructor(pool, idGenerator) {
    super();

    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addUser(registerUser) {
    const { username, password, fullname } = registerUser;
    const id = `user-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id, username, fullname',
      values: [id, username, password, fullname],
    };

    const result = await this._pool.query(query);
    return new RegisteredUser({ ...result.rows[0] });
  }

  async getIdByUsername(username) {
    const query = {
      text: 'SELECT id FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return null;
    }

    return new UserId({ ...result.rows[0] });
  }

  async getPasswordByUsername(username) {
    const query = {
      text: 'SELECT password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return null;
    }

    return new UserPassword({ ...result.rows[0] });
  }

  async isUsernameExist(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);
    return result.rows.length > 0;
  }
}

module.exports = UserRepositoryPostgres;
