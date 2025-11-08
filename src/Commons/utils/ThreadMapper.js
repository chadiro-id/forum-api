const AddedThread = require('../../Domains/threads/entities/AddedThread');

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
}

module.exports = ThreadMapper;