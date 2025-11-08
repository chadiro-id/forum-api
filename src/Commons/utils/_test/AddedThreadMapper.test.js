const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddedThreadMapper = require('../AddedThreadMapper');

describe('AddedThreadMapper', () => {
  it('should correctly map database row to AddedThread entity', () => {
    const dbRow = {
      id: 'thread-123',
      title: 'Sebuah thread',
      owner_id: 'user-456',
    };

    const addedThread = AddedThreadMapper.toEntity(dbRow);

    expect(addedThread).toStrictEqual(new AddedThread({
      id: dbRow.id,
      title: dbRow.title,
      owner: dbRow.owner_id,
    }));
  });
});