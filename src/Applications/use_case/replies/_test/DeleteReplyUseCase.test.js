const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    replyId: 'reply-123',
    owner: 'user-123',
  };

  let mockThreadRepo;
  let mockCommentRepo;
  let mockReplyRepo;

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
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
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
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentExists.mockResolvedValue();
      mockReplyRepo.verifyReplyOwner.mockResolvedValue();
      mockReplyRepo.softDeleteReplyById.mockResolvedValue();

      const useCase = new DeleteReplyUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      await expect(useCase.execute({ ...dummyPayload })).resolves.not.toThrow();

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