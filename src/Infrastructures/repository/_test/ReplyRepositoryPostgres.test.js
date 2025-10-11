const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  describe('ReplyRepository contract enforcement', () => {
    it('must be an instance of ReplyRepository', () => {
      const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, () => ('123'));

      expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepository);
    });
  });
});