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

    it('should throw error when reply not exist', async () => {
      mockReplyRepo.getReplyForDeletion.mockResolvedValue(null);

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.REPLY_NOT_EXIST');

      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should throw error when owner not match', async () => {
      mockReplyRepo.getReplyForDeletion.mockResolvedValue(new ReplyOwner({
        owner: 'user-999',
      }));

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.OWNER_NOT_MATCH');

      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should propagate error when getReplyForDeletion fails', async () => {
      mockReplyRepo.getReplyForDeletion.mockRejectedValue(new Error('fails'));

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });

    it('should propagate error when softDeleteReplyById fails', async () => {
      const { owner } = dummyPayload;

      mockReplyRepo.getReplyForDeletion.mockResolvedValue(new ReplyOwner({ owner }));
      mockReplyRepo.softDeleteReplyById.mockRejectedValue(new Error('fails'));

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });
  });

  describe('Successfull executions', () => {
    it('should correctly orchestrating the delete reply action', async () => {
      const { threadId, commentId, replyId, owner } = dummyPayload;

      mockReplyRepo.getReplyForDeletion.mockResolvedValue(new ReplyOwner({ owner }));
      mockReplyRepo.softDeleteReplyById.mockResolvedValue();

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .resolves.not.toThrow();

      expect(mockReplyRepo.getReplyForDeletion).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.getReplyForDeletion).toHaveBeenCalledWith(replyId, commentId, threadId);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledWith(replyId);
    });
  });
});