const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const ThreadDetailsMapper = require('../ThreadDetailsMapper');

describe('ThreadDetailsMapper', () => {
  it('should correctly map joined database row to ThreadDetails entity', () => {
    const timestamp = new Date();
    const dbRow = {
      id: 'thread-123',
      title: 'Detail Thread',
      body: 'Isi detail',
      username: 'john_doe',
      created_at: timestamp,
    };

    const detailThread = ThreadDetailsMapper.toEntity(dbRow);

    expect(detailThread).toStrictEqual(new ThreadDetails({
      id: dbRow.id,
      title: dbRow.title,
      body: dbRow.body,
      username: dbRow.username,
      date: dbRow.created_at,
    }));
  });
});