const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    replyId: 'reply-123',
    owner: 'user-123',
  };

  describe('Fails execution', () => {
    it('should throw error when payload not contain needed property', async () => {
      const missingThreadId = { ...dummyPayload };
      delete missingThreadId.threadId;
      const missingCommentId = { ...dummyPayload };
      delete missingCommentId.commentId;
      const missingReplyId = { ...dummyPayload };
      delete missingReplyId.replyId;
      const missingOwner = { ...dummyPayload };
      delete missingOwner.owner;

      const emptyThreadId = { ...dummyPayload, threadId: '' };
      const emptyCommentId = { ...dummyPayload, commentId: '' };
      const emptyReplyId = { ...dummyPayload, replyId: '' };
      const emptyOwner = { ...dummyPayload, owner: '' };

      const useCase = new DeleteReplyUseCase({});
      await expect(useCase.execute(missingThreadId))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(missingCommentId))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(missingReplyId))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(missingOwner))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyThreadId))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyCommentId))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyReplyId))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyOwner))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', async () => {
      const threadIdNotString = { ...dummyPayload, threadId: 123 };
      const commentIdNotString = { ...dummyPayload, commentId: [1, 2, 3] };
      const replyIdNotString = { ...dummyPayload, replyId: {} };
      const ownerNotString = { ...dummyPayload, owner: true };

      const useCase = new DeleteReplyUseCase({});

      await expect(useCase.execute(threadIdNotString))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      await expect(useCase.execute(commentIdNotString))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      await expect(useCase.execute(replyIdNotString))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      await expect(useCase.execute(ownerNotString))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Successfull execution', () => {
    it('should correctly orchestrating the delete reply action', async () => {
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
      mockCommentRepository.verifyCommentExists = jest.fn().mockResolvedValue();
      mockReplyRepository.verifyReplyOwner = jest.fn().mockResolvedValue();
      mockReplyRepository.softDeleteReplyById = jest.fn().mockResolvedValue();

      const useCase = new DeleteReplyUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      await expect(useCase.execute({ ...dummyPayload }))
        .resolves.not.toThrow();

      expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledTimes(1);
      expect(mockCommentRepository.verifyCommentExists).toHaveBeenCalledWith(dummyPayload.commentId);
      expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledTimes(1);
      expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(dummyPayload.replyId, dummyPayload.owner);
      expect(mockReplyRepository.softDeleteReplyById).toHaveBeenCalledTimes(1);
      expect(mockReplyRepository.softDeleteReplyById).toHaveBeenCalledWith(dummyPayload.replyId);
    });
  });
});