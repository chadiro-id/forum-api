const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository', () => {
  const replyRepository = new ReplyRepository();
  const methods = [
    replyRepository.addReply,
    replyRepository.getRepliesByCommentIds,
    replyRepository.getReplyForDeletion,
    replyRepository.softDeleteReplyById,
  ];

  test.each(methods)('should throw error when abstract behavior invoked %p', async (fn) => {
    await expect(fn())
      .rejects.toThrow('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});