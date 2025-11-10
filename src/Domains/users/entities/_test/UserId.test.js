const UserId = require('../UserId');

describe('UserId Entity', () => {
  it('should correctly create the entity', () => {
    const payload = { id: 'user-123' };

    const { id } = new UserId(payload);
    expect(id).toEqual(payload.id);
  });

  it('should throw error when payload not contain needed property', () => {
    const missingId = {};
    const emptyId = {};

    expect(() => new UserId(missingId))
      .toThrow('USER_ID.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new UserId(emptyId))
      .toThrow('USER_ID.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property does not meet data type specification', () => {
    const idNotString = { id: ['user-123'] };

    expect(() => new UserId(idNotString))
      .toThrow('USER_ID.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});