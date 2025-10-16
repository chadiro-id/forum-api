const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const NewReply = require('../../../../Domains/replies/entities/NewReply');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    content: 'Sebuah balasan',
    owner: 'user-123',
  };

  describe('Fails execution', () => {
    it('should throw error when payload not provided correctly', async () => {
      const useCase = new AddReplyUseCase({});

      await expect(useCase.execute())
        .rejects.toThrow();
      await expect(useCase.execute({}))
        .rejects.toThrow();
      await expect(useCase.execute({ ...dummyPayload, content: 123 }))
        .rejects.toThrow();
    });

    it('should throw error when the added reply instance is not AddedReply entity', async () => {
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
      mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue();
      mockReplyRepository.addReply = jest.fn().mockResolvedValue({
        id: 'reply-123',
        content: 'Sebuah balasan',
        owner: 'user-123',
      });

      const useCase = new AddReplyUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      await expect(useCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_REPLY_USE_CASE.ADDED_REPLY_MUST_BE_INSTANCE_OF_ADDED_REPLY_ENTITY');

      expect(mockThreadRepository.verifyThreadExists)
        .toHaveBeenCalledTimes(1);
      expect(mockCommentRepository.verifyCommentExists)
        .toHaveBeenCalledTimes(1);
      expect(mockReplyRepository.addReply)
        .toHaveBeenCalledTimes(1);
      expect(mockReplyRepository.addReply)
        .toHaveBeenCalledWith(new NewReply({
          commentId: dummyPayload.commentId,
          content: dummyPayload.content,
          owner: dummyPayload.owner,
        }));
    });
  });
});