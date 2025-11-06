const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');

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
      const { threadId, commentId } = dummyPayload;
      mockCommentRepo.getCommentForDeletion.mockResolvedValue(null);

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.COMMENT_NOT_EXIST');

      expect(mockCommentRepo.getCommentForDeletion).toHaveBeenCalledWith(commentId, threadId);
      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });

    it('should throw error when comment owner invalid', async () => {
      const { threadId, commentId } = dummyPayload;
      mockCommentRepo.getCommentForDeletion.mockResolvedValue({ owner: '' });

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.COMMENT_OWNER_MUST_NON_EMPTY_STRING');

      expect(mockCommentRepo.getCommentForDeletion).toHaveBeenCalledWith(commentId, threadId);
      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });

    it('should throw error when owner not match', async () => {
      const { threadId, commentId } = dummyPayload;
      mockCommentRepo.getCommentForDeletion.mockResolvedValue({ owner: 'user-999' });

      await expect(deleteCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_COMMENT_USE_CASE.OWNER_NOT_MATCH');

      expect(mockCommentRepo.getCommentForDeletion).toHaveBeenCalledWith(commentId, threadId);
      expect(mockCommentRepo.softDeleteCommentById).not.toHaveBeenCalled();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestracting the delete comment action', async () => {
      const { threadId, commentId, owner } = dummyPayload;

      mockCommentRepo.getCommentForDeletion.mockResolvedValue({ owner });
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