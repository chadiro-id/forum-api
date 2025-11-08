const CommentOwner = require('../CommentOwner');

describe('CommentOwner', () => {
  it('should correctly create the entity', () => {
    const payload = { owner: 'user-123' };

    const { owner } = new CommentOwner(payload);
    expect(owner).toBe(payload.owner);
  });

  it('should throw error when payload not contain needed property', () => {
    const missingOwner = {};
    const emptyOwner = { owner: '' };

    expect(() => new CommentOwner(missingOwner))
      .toThrow('COMMENT_OWNER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    expect(() => new CommentOwner(emptyOwner))
      .toThrow('COMMENT_OWNER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload property does not meet data type specification', () => {
    const ownerNotString = { owner: 123 };

    expect(() => new CommentOwner(ownerNotString))
      .toThrow('COMMENT_OWNER.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});