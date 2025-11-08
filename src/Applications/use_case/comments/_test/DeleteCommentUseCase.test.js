const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const CommentOwner = require('../../../../Domains/comments/entities/CommentOwner');

const dummyPayload = {
  threadId: 'thread-123',
  commentId: 'comment-123',
  owner: 'user-123',
};

describe('DeleteCommentUseCase', () => {
  let mockCommentRepo;
  let deleteCommentUseCase;

  beforeEach(() => {
    mockCommentRepo = new CommentRepository();
    mockCommentRepo.getCommentForDeletion = jest.fn();
    mockCommentRepo.softDeleteCommentById = jest.fn();

    deleteCommentUseCase = new DeleteCommentUseCase({
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

    it('should throw error when comment not exist', async () => {
      mockCommentRepo.getCommentForDeletion.mockResolvedValue(null);

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.COMMENT_NOT_EXIST');

      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });

    it('should throw error when owner not match', async () => {
      mockCommentRepo.getCommentForDeletion.mockResolvedValue(new CommentOwner({ owner: 'user-999' }));

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.OWNER_NOT_MATCH');

      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });

    it('should propagate error when getCommentForDeletion fails', async () => {
      mockCommentRepo.getCommentForDeletion.mockRejectedValue(new Error('fails'));

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });

    it('should propagate error when softDeleteCommentById fails', async () => {
      const { owner } = dummyPayload;
      mockCommentRepo.getCommentForDeletion.mockResolvedValue(new CommentOwner({ owner }));
      mockCommentRepo.softDeleteCommentById.mockRejectedValue(new Error('fails'));

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalled();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestracting the delete comment action', async () => {
      const { threadId, commentId, owner } = dummyPayload;

      mockCommentRepo.getCommentForDeletion.mockResolvedValue(new CommentOwner({ owner }));
      mockCommentRepo.softDeleteCommentById.mockResolvedValue();

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .resolves.not.toThrow();

      expect(mockCommentRepo.getCommentForDeletion).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.getCommentForDeletion).toHaveBeenCalledWith(commentId, threadId);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.softDeleteCommentById).toHaveBeenCalledWith(commentId);
    });
  });
});