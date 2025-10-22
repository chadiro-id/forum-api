const DeleteCommentUseCase = require('../DeleteCommentUseCase');

const dummyPayload = {
  threadId: 'thread-123',
  commentId: 'comment-123',
  owner: 'user-123',
};

describe('DeleteCommentUseCase', () => {
  let mockThreadRepo;
  let mockCommentRepo;
  let deleteCommentUseCase;

  beforeEach(() => {
    mockThreadRepo = {
      verifyThreadExists: jest.fn(),
    };
    mockCommentRepo = {
      verifyDeleteComment: jest.fn(),
      softDeleteCommentById: jest.fn(),
    };
    deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(deleteCommentUseCase.execute()).rejects.toThrow();
      await expect(deleteCommentUseCase.execute({})).rejects.toThrow();
    });

    it('should propagate error when thread not exists', async () => {
      mockThreadRepo.verifyThreadExists.mockRejectedValue(new Error('thread not found'));

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyDeleteComment).not.toHaveBeenCalled();
      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });

    it('should propagate error when delete comment verification fails', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyDeleteComment.mockRejectedValue(new Error('verification fails'));

      const { threadId, commentId, owner } = dummyPayload;

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepo.verifyDeleteComment).toHaveBeenCalledWith(commentId, threadId, owner);
      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });

    it('should propagate error when delete comment fails', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyDeleteComment.mockResolvedValue();
      mockCommentRepo.softDeleteCommentById.mockRejectedValue(new Error('delete comment fails'));

      const { threadId, commentId, owner } = dummyPayload;

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepo.verifyDeleteComment).toHaveBeenCalledWith(commentId, threadId, owner);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledWith(commentId);
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestracting the delete comment action', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyDeleteComment.mockResolvedValue();
      mockCommentRepo.softDeleteCommentById.mockResolvedValue();

      const { threadId, commentId, owner } = dummyPayload;

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .resolves.not.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepo.verifyDeleteComment).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.verifyDeleteComment).toHaveBeenCalledWith(commentId, threadId, owner);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledWith(commentId);
    });
  });
});