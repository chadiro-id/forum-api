const AddedThread = require('../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../Domains/threads/entities/DetailThread');

class ThreadMapper {
  /**
   * Menerjemahkan data hasil INSERT database
   * @param {{ id: string, title: string, owner_id: string }} addedThread Persistence
   * @returns {AddedThread} Domain Entity
   */
  static mapAddedThreadToDomain({
    id, title, owner_id
  }) {
    return new AddedThread({
      id,
      title,
      owner: owner_id,
    });
  }

  /**
   * Menerjemahkan data hasil SELECT database
   * @param {{
   *   id: string,
   *   title: string,
   *   body: string,
   *   username: string,
   *   created_at: Date
   * }} detailThread Persistence
   * @returns {DetailThread} Domain Entity
   */
  static mapDetailThreadToDomain({
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

module.exports = ThreadMapper;