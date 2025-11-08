const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadDetails = require('../../Domains/threads/entities/ThreadDetails');

class ThreadMapper {
  /**
   * Translate result data from database INSERT
   * @param {{ id: string, title: string, owner_id: string }} row Persistence Model
   * @returns Domain Entity
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
   * Translate result data from database SELECT
   * @param {{
   *   id: string,
   *   title: string,
   *   body: string,
   *   username: string,
   *   created_at: Date
   * }} row Persistence Model
   * @returns Domain Entity
   */
  static mapThreadDetailsToDomain({
    id,
    title,
    body,
    username,
    created_at
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

module.exports = ThreadMapper;