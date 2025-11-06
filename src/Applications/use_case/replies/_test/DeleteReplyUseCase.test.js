const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');

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
    mockThreadRepo = new ThreadRepository();
    mockThreadRepo.isThreadExist = jest.fn();

    mockCommentRepo = new CommentRepository();
    mockCommentRepo.verifyCommentBelongToThread = jest.fn();

    mockReplyRepo = new ReplyRepository();
    mockReplyRepo.verifyDeleteReply = jest.fn();
    mockReplyRepo.softDeleteReplyById = jest.fn();

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
      mockThreadRepo.isThreadExist.mockResolvedValue(false);

      await expect(deleteReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('DELETE_REPLY_USE_CASE.THREAD_NOT_FOUND');

      expect(mockThreadRepo.isThreadExist).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentBelongToThread).not.toHaveBeenCalled();
      expect(mockReplyRepo.verifyDeleteReply).not.toHaveBeenCalled();
      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should propagate error when comment verification fails', async () => {
      mockThreadRepo.isThreadExist.mockResolvedValue(true);
      mockCommentRepo.verifyCommentBelongToThread.mockRejectedValue(new Error('comment not found'));

      await expect(deleteReplyUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.isThreadExist).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentBelongToThread).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.threadId);
      expect(mockReplyRepo.verifyDeleteReply).not.toHaveBeenCalled();
      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should propagate error when delete reply verification fails', async () => {
      mockThreadRepo.isThreadExist.mockResolvedValue(true);
      mockCommentRepo.verifyCommentBelongToThread.mockResolvedValue();
      mockReplyRepo.verifyDeleteReply.mockRejectedValue(new Error('verification fails'));

      const { threadId, commentId, replyId, owner } = dummyPayload;

      await expect(deleteReplyUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.isThreadExist).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepo.verifyCommentBelongToThread).toHaveBeenCalledWith(commentId, threadId);
      expect(mockReplyRepo.verifyDeleteReply).toHaveBeenCalledWith(replyId, commentId, owner);
      expect(mockReplyRepo.softDeleteReplyById).not.toHaveBeenCalled();
    });

    it('should propagate error when delete reply fails', async () => {
      mockThreadRepo.isThreadExist.mockResolvedValue(true);
      mockCommentRepo.verifyCommentBelongToThread.mockResolvedValue();
      mockReplyRepo.verifyDeleteReply.mockResolvedValue();
      mockReplyRepo.softDeleteReplyById.mockRejectedValue(new Error('delete action fails'));

      const { threadId, commentId, replyId, owner } = dummyPayload;

      await expect(deleteReplyUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.isThreadExist).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepo.verifyCommentBelongToThread).toHaveBeenCalledWith(commentId, threadId);
      expect(mockReplyRepo.verifyDeleteReply).toHaveBeenCalledWith(replyId, commentId, owner);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledWith(dummyPayload.replyId);
    });
  });

  describe('Successfull executions', () => {
    it('should correctly orchestrating the delete reply action', async () => {
      mockThreadRepo.isThreadExist.mockResolvedValue(true);
      mockCommentRepo.verifyCommentBelongToThread.mockResolvedValue();
      mockReplyRepo.verifyDeleteReply.mockResolvedValue();
      mockReplyRepo.softDeleteReplyById.mockResolvedValue();

      const { threadId, commentId, replyId, owner } = dummyPayload;

      await expect(deleteReplyUseCase.execute({ ...dummyPayload })).resolves.not.toThrow();

      expect(mockThreadRepo.isThreadExist).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.isThreadExist).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepo.verifyCommentBelongToThread).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.verifyCommentBelongToThread).toHaveBeenCalledWith(commentId, threadId);
      expect(mockReplyRepo.verifyDeleteReply).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.verifyDeleteReply).toHaveBeenCalledWith(replyId, commentId, owner);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.softDeleteReplyById).toHaveBeenCalledWith(dummyPayload.replyId);
    });
  });
});