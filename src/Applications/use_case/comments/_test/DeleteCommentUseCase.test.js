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
      verifyCommentOwner: jest.fn(),
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
      expect(mockCommentRepo.verifyCommentOwner).not.toHaveBeenCalled();
      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });

    it('should propagate error when comment owner verification fails', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentOwner.mockRejectedValue(new Error('verification fails'));

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentOwner).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.owner);
      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });

    it('should propagate error when delete comment fails', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentOwner.mockResolvedValue();
      mockCommentRepo.softDeleteCommentById.mockRejectedValue(new Error('delete comment fails'));

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentOwner).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.owner);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledWith(dummyPayload.commentId);
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestracting the delete comment action', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentOwner.mockResolvedValue();
      mockCommentRepo.softDeleteCommentById.mockResolvedValue();

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .resolves.not.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentOwner).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.verifyCommentOwner).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.owner);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledWith(dummyPayload.commentId);
    });
  });
});