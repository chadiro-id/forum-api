const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository', () => {
  it('should throw error with properly message when abstract method invoked', () => {
    const replyRepository = new ReplyRepository();

    expect(replyRepository.addReply({}))
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(replyRepository.getRepliesByCommentIds([]))
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(replyRepository.deleteReplyById(''))
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(replyRepository.verifyExistsById(''))
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    expect(replyRepository.verifyReplyOwner('', ''))
      .toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});