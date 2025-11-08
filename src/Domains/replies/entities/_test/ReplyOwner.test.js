const ReplyOwner = require('../ReplyOwner');

describe('ReplyOwner Entity', () => {
  it('should correctly create the entity', () => {
    const payload = { owner: 'user-123' };

    const { owner } = new ReplyOwner(payload);
    expect(owner).toBe(payload.owner);
  });
});