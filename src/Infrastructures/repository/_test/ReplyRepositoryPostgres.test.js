const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  describe('ReplyRepository contract enforcement', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, () => {});

    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
  });
});