/* istanbul ignore file */
class ThreadsTable {
  constructor(pool) {
    this._pool = pool;
  }

  async cleanTable() {
    await this._pool.query('DELETE FROM threads WHERE 1=1');
  }
};

module.exports = ThreadsTable;