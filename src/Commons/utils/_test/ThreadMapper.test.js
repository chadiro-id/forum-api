const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadMapper = require('../ThreadMapper');

describe('ThreadMapper', () => {
  describe('mapAddedThreadToDomain', () => {
    it('should correctly map database row to AddedThread entity', () => {
      const dbRow = {
        id: 'thread-123',
        title: 'Sebuah thread',
        owner_id: 'user-456',
      };

      const addedThread = ThreadMapper.mapAddedThreadToDomain(dbRow);

      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(addedThread).toEqual({
        id: 'thread-123',
        title: 'Sebuah thread',
        owner: 'user-456',
      });
    });
  });

  describe('mapDetailThreadToDomain', () => {
    it('should correctly map joined database row to DetailThread entity', () => {
      const dbRow = {
        id: 'thread-123',
        title: 'Detail Thread',
        body: 'Isi detail',
        username: 'john_doe',
        created_at: new Date('2024-11-01T10:00:00.000Z'),
      };

      const detailThread = ThreadMapper.mapDetailThreadToDomain(dbRow);

      expect(detailThread).toStrictEqual(new DetailThread({
        id: 'thread-123',
        title: 'Detail Thread',
        body: 'Isi detail',
        username: 'john_doe',
        date: new Date('2024-11-01T10:00:00.000Z'),
      }));
    });
  });
});