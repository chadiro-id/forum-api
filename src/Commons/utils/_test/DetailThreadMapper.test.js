const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailThreadMapper = require('../DetailThreadMapper');

describe('DetailThreadMapper', () => {
  it('should correctly map joined database row to DetailThread entity', () => {
    const dbRow = {
      id: 'thread-123',
      title: 'Detail Thread',
      body: 'Isi detail',
      username: 'john_doe',
      created_at: new Date('2024-11-01T10:00:00.000Z'),
    };

    const detailThread = DetailThreadMapper.toEntity(dbRow);

    expect(detailThread).toStrictEqual(new DetailThread({
      id: 'thread-123',
      title: 'Detail Thread',
      body: 'Isi detail',
      username: 'john_doe',
      date: new Date('2024-11-01T10:00:00.000Z'),
    }));
  });
});