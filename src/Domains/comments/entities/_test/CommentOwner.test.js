const CommentOwner = require('../CommentOwner');

describe('CommentOwner', () => {
  it('should correctly create the entity', () => {
    const payload = { owner: 'user-123' };

    const { owner } = new CommentOwner(payload);
    expect(owner).toBe(payload.owner);
  });
});