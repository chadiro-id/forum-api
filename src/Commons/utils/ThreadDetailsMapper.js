const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');

class ThreadDetailsMapper {
  /**
   * Menerjemahkan data hasil SELECT database
   * @param {{
   *   id: string,
   *   title: string,
   *   body: string,
   *   username: string,
   *   created_at: Date
   * }} row Persistence
   * @returns {ThreadDetails} Domain Entity
   */
  static toEntity({
    id, title, body, username, created_at
  }) {
    return new ThreadDetails({
      id,
      title,
      body,
      username,
      date: created_at,
    });
  }
}

module.exports = ThreadDetailsMapper;