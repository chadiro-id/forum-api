const DeleteReplyUseCase = require('../DeleteReplyUseCase');

const dummyPayload = {
  threadId: 'thread-123',
  commentId: 'comment-123',
  replyId: 'reply-123',
  owner: 'user-123',
};

describe('DeleteReplyUseCase', () => {
  let mockThreadRepo;
  let mockCommentRepo;
  let mockReplyRepo;
  let deleteReplyUseCase;

  beforeEach(() => {
    mockThreadRepo = {
      verifyThreadExists: jest.fn(),
    };
    mockCommentRepo = {
      verifyCommentExists: jest.fn(),
    };
    mockReplyRepo = {
      verifyReplyOwner: jest.fn(),
      softDeleteReplyById: jest.fn(),
    };
    deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(deleteReplyUseCase.execute()).rejects.toThrow();
      await expect(deleteReplyUseCase.execute({ replyId: 'reply-123' })).rejects.toThrow();
    });

    it('should propagate error when thread not exists', async () => {
      mockThreadRepo.verifyThreadExists.mockRejectedValue(new Error('thread not found'));

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentExists).not.toHaveBeenCalled();
      expect(mockReplyRepo.verifyReplyOwner).not.toHaveBeenCalled();
      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should propagate error when comment not exists', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentExists.mockRejectedValue(new Error('comment not found'));

      await expect(deleteReplyUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledWith(dummyPayload.commentId);
      expect(mockReplyRepo.verifyReplyOwner).not.toHaveBeenCalled();
      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should propagate error when owner verification fails', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentExists.mockResolvedValue();
      mockReplyRepo.verifyReplyOwner.mockRejectedValue(new Error('verification fails'));

      await expect(deleteReplyUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledWith(dummyPayload.commentId);
      expect(mockReplyRepo.verifyReplyOwner).toHaveBeenCalledWith(dummyPayload.replyId, dummyPayload.owner);
      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should propagate error when delete reply fails', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentExists.mockResolvedValue();
      mockReplyRepo.verifyReplyOwner.mockResolvedValue();
      mockReplyRepo.softDeleteReplyById.mockRejectedValue(new Error('delete action fails'));

      await expect(deleteReplyUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledWith(dummyPayload.commentId);
      expect(mockReplyRepo.verifyReplyOwner).toHaveBeenCalledWith(dummyPayload.replyId, dummyPayload.owner);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledWith(dummyPayload.replyId);
    });
  });

  describe('Successfull executions', () => {
    it('should correctly orchestrating the delete reply action', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentExists.mockResolvedValue();
      mockReplyRepo.verifyReplyOwner.mockResolvedValue();
      mockReplyRepo.softDeleteReplyById.mockResolvedValue();

      await expect(deleteReplyUseCase.execute({ ...dummyPayload })).resolves.not.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledWith(dummyPayload.commentId);
      expect(mockReplyRepo.verifyReplyOwner).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.verifyReplyOwner).toHaveBeenCalledWith(dummyPayload.replyId, dummyPayload.owner);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledWith(dummyPayload.replyId);
    });
  });
});