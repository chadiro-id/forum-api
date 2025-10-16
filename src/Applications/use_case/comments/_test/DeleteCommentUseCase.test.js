const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    owner: 'user-123',
  };

  describe('fails executions', () => {
    it('should throw error when payload not contain needed property', async () => {
      const missingThreadId = { ...dummyPayload };
      delete missingThreadId.threadId;
      const missingCommentId = { ...dummyPayload };
      delete missingCommentId.commentId;
      const missingOwner = { ...dummyPayload };
      delete missingOwner.owner;

      const emptyThreadId = { ...dummyPayload, threadId: '' };
      const emptyCommentId = { ...dummyPayload, commentId: '' };
      const emptyOwner = { ...dummyPayload, owner: '' };

      const useCase = new DeleteCommentUseCase({});

      await expect(useCase.execute(missingThreadId))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(missingCommentId))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(missingOwner))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyThreadId))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyCommentId))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyOwner))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should thow error when payload property does not meet data type specification', async () => {
      const threadIdNotString = { ...dummyPayload, threadId: 123 };
      const commentIdNotString = { ...dummyPayload, commentId: [1, 2, 3] };
      const ownerNotString = { ...dummyPayload, owner: true };

      const useCase = new DeleteCommentUseCase({});

      await expect(useCase.execute(threadIdNotString))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      await expect(useCase.execute(commentIdNotString))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      await expect(useCase.execute(ownerNotString))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });
  });

  describe('Successfull executions', () => {
    it('should correctly orchestracting the delete comment action', async () => {
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();

      mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
      mockCommentRepository.verifyCommentOwner = jest.fn().mockResolvedValue();
      mockCommentRepository.softDeleteCommentById = jest.fn().mockResolvedValue();

      const useCase = new DeleteCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
      });

      await expect(useCase.execute({ ...dummyPayload }))
        .resolves.not.toThrow();

      expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledTimes(1);
      expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.owner);
      expect(mockCommentRepository.softDeleteCommentById).toHaveBeenCalledTimes(1);
      expect(mockCommentRepository.softDeleteCommentById).toHaveBeenCalledWith(dummyPayload.commentId);
    });
  });
});