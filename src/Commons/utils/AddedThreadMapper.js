const AddedThread = require('../../Domains/threads/entities/AddedThread');

class AddedThreadMapper {
  /**
   * Menerjemahkan data hasil INSERT database
   * @param {{ id: string, title: string, owner_id: string }} row Persistence
   * @returns {AddedThread} Domain Entity
   */
  static toEntity({
    id, title, owner_id
  }) {
    return new AddedThread({
      id,
      title,
      owner: owner_id,
    });
  }
}

module.exports = AddedThreadMapper;