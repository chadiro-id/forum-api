const ReplyOwner = require('../ReplyOwner');

describe('ReplyOwner Entity', () => {
  it('should correctly create the entity', () => {
    const payload = { owner: 'user-123' };

    const { owner } = new ReplyOwner(payload);
    expect(owner).toBe(payload.owner);
  });

  it('should throw error when payload not contain needed property', () => {
    const missingOwner = {};
    const emptyOwner = { owner: '' };

    expect(() => new ReplyOwner(missingOwner))
      .toThrow('REPLY_OWNER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new ReplyOwner(emptyOwner))
      .toThrow('REPLY_OWNER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });
});