const ArrayGroupUtils = require('../ArrayGroupUtils');

describe('ArrayGroupUtils', () => {
  describe('groupToObjectBy', () => {
    it('should correctly grouping array items and return grouped object', () => {
      const arr = [
        {
          id: 'array-id-001',
          otherId: 'other-id-010',
          content: 'array content',
        },
        {
          id: 'array-id-002',
          otherId: 'other-id-020',
          content: 'array content',
        },
        {
          id: 'array-id-003',
          otherId: 'other-id-020',
          content: 'array content',
        },
      ];

      const result = ArrayGroupUtils.groupToObjectBy(arr, 'otherId');
      expect(result).toStrictEqual({
        'other-id-010': [arr[0]],
        'other-id-020': [arr[1], arr[2]],
      });
    });
  });
});