const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailThreadMapper = require('../DetailThreadMapper');

describe('DetailThreadMapper', () => {
  it('should correctly map joined database row to DetailThread entity', () => {
    const timestamp = new Date();
    const dbRow = {
      id: 'thread-123',
      title: 'Detail Thread',
      body: 'Isi detail',
      username: 'john_doe',
      created_at: timestamp,
    };

    const detailThread = DetailThreadMapper.toEntity(dbRow);

    expect(detailThread).toStrictEqual(new DetailThread({
      id: dbRow.id,
      title: dbRow.title,
      body: dbRow.body,
      username: dbRow.username,
      date: dbRow.created_at,
    }));
  });
});