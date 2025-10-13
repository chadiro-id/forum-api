const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository', () => {
  it('should throw error with properly message when abstract method invoked', async () => {
    const replyRepository = new ReplyRepository();

    await expect(replyRepository.addReply({}))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.getRepliesByCommentIds([]))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.softDeleteReplyById(''))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.verifyReplyExists(''))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(replyRepository.verifyReplyOwner('', ''))
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});