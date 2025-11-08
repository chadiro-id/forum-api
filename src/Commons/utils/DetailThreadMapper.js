const DetailThread = require('../../Domains/threads/entities/ThreadDetails');

class DetailThreadMapper {
  /**
   * Menerjemahkan data hasil SELECT database
   * @param {{
   *   id: string,
   *   title: string,
   *   body: string,
   *   username: string,
   *   created_at: Date
   * }} row Persistence
   * @returns {DetailThread} Domain Entity
   */
  static toEntity({
    id, title, body, username, created_at
  }) {
    return new DetailThread({
      id,
      title,
      body,
      username,
      date: created_at,
    });
  }
}

module.exports = DetailThreadMapper;