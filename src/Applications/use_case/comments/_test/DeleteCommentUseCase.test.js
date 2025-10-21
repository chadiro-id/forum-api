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
        .rejects
        .toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(missingCommentId))
        .rejects
        .toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(missingOwner))
        .rejects
        .toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyThreadId))
        .rejects
        .toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyCommentId))
        .rejects
        .toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
      await expect(useCase.execute(emptyOwner))
        .rejects
        .toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload property does not meet data type specification', async () => {
      const threadIdNotString = { ...dummyPayload, threadId: 123 };
      const commentIdNotString = { ...dummyPayload, commentId: [1, 2, 3] };
      const ownerNotString = { ...dummyPayload, owner: true };

      const useCase = new DeleteCommentUseCase({});

      await expect(useCase.execute(threadIdNotString))
        .rejects
        .toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      await expect(useCase.execute(commentIdNotString))
        .rejects
        .toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
      await expect(useCase.execute(ownerNotString))
        .rejects
        .toThrow('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
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