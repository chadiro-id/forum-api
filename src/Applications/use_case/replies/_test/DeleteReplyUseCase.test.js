const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const ReplyOwner = require('../../../../Domains/replies/entities/ReplyOwner');

const dummyPayload = {
  threadId: 'thread-123',
  commentId: 'comment-123',
  replyId: 'reply-123',
  owner: 'user-123',
};

describe('DeleteReplyUseCase', () => {
  let mockReplyRepo;
  let deleteReplyUseCase;

  beforeEach(() => {
    mockReplyRepo = new ReplyRepository();
    mockReplyRepo.getReplyForDeletion = jest.fn();
    mockReplyRepo.softDeleteReplyById = jest.fn();

    deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepo,
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(deleteReplyUseCase.execute()).rejects.toThrow();
      await expect(deleteReplyUseCase.execute({ replyId: 'reply-123' })).rejects.toThrow();
    });

    it('should throw error when reply is null', async () => {
      mockReplyRepo.getReplyForDeletion.mockResolvedValue(null);

      const { threadId, commentId, replyId } = dummyPayload;

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.REPLY_NOT_EXIST');

      expect(mockReplyRepo.getReplyForDeletion).toHaveBeenCalledWith(replyId, commentId, threadId);
      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should throw error when reply owner verification fails', async () => {
      mockReplyRepo.getReplyForDeletion.mockResolvedValue(new ReplyOwner({
        owner: 'user-999',
      }));

      const { threadId, commentId, replyId } = dummyPayload;

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.OWNER_NOT_MATCH');

      expect(mockReplyRepo.getReplyForDeletion).toHaveBeenCalledWith(replyId, commentId, threadId);
      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should propagate error when delete reply fails', async () => {
      const { threadId, commentId, replyId, owner } = dummyPayload;

      mockReplyRepo.getReplyForDeletion.mockResolvedValue(new ReplyOwner({ owner }));
      mockReplyRepo.softDeleteReplyById.mockRejectedValue(new Error('delete action fails'));

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockReplyRepo.getReplyForDeletion).toHaveBeenCalledWith(replyId, commentId, threadId);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledWith(dummyPayload.replyId);
    });
  });

  describe('Successfull executions', () => {
    it('should correctly orchestrating the delete reply action', async () => {
      const { threadId, commentId, replyId, owner } = dummyPayload;

      mockReplyRepo.getReplyForDeletion.mockResolvedValue({ owner });
      mockReplyRepo.softDeleteReplyById.mockResolvedValue();

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .resolves.not.toThrow();

      expect(mockReplyRepo.getReplyForDeletion).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.getReplyForDeletion).toHaveBeenCalledWith(replyId, commentId, threadId);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledWith(dummyPayload.replyId);
    });
  });
});