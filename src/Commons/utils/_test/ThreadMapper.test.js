const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadDetails = require('../../../Domains/threads/entities/ThreadDetails');
const ThreadMapper = require('../ThreadMapper');
const { createRawThread } = require('../../../../tests/util');

describe('ThreadMapper', () => {
  describe('mapAddedThreadToDomain', () => {
    it('should correctly map data to AddedThread domain entity', () => {
      const dbRow = {
        id: 'thread-123',
        title: 'Sebuah thread',
        owner_id: 'user-456',
      };

      const result = ThreadMapper.mapAddedThreadToDomain(dbRow);
      expect(result).toStrictEqual(new AddedThread({
        id: dbRow.id,
        title: dbRow.title,
        owner: dbRow.owner_id,
      }));
    });
  });

  describe('mapThreadDetailsToDomain', () => {
    it('should correctly map data to ThreadDetails domain entity', () => {
      const dbRow = createRawThread();

      const result = ThreadMapper.mapThreadDetailsToDomain(dbRow);
      expect(result).toStrictEqual(new ThreadDetails({
        id: dbRow.id,
        title: dbRow.title,
        body: dbRow.body,
        username: dbRow.username,
        date: dbRow.created_at,
      }));
    });
  });
});