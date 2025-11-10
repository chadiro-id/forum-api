const AddedComment = require('../../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../../Domains/comments/entities/NewComment');
const AddCommentUseCase = require('../AddCommentUseCase');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');

const dummyPayload = {
  threadId: 'thread-123',
  content: 'Sebuah komentar',
  userId: 'user-123',
};

describe('AddCommentUseCase', () => {
  const mockThreadRepo = new ThreadRepository();
  mockThreadRepo.isThreadExist = jest.fn();

  const mockCommentRepo = new CommentRepository();
  mockCommentRepo.addComment = jest.fn();

  const addCommentUseCase = new AddCommentUseCase({
    commentRepository: mockCommentRepo,
    threadRepository: mockThreadRepo,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(addCommentUseCase.execute({ ...dummyPayload, content: true }))
        .rejects.toThrow('NEW_COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error when thread not exist', async () => {
      mockThreadRepo.isThreadExist.mockResolvedValue(false);

      await expect(addCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND');

      expect(mockCommentRepo.addComment).not.toHaveBeenCalled();
    });

    it('should propagate error when isThreadExist fails', async () => {
      mockThreadRepo.isThreadExist.mockRejectedValue(new Error('fails'));

      await expect(addCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockCommentRepo.addComment).not.toHaveBeenCalled();
    });

    it('should propagate error when addComment fails', async () => {
      mockThreadRepo.isThreadExist.mockResolvedValue(true);
      mockCommentRepo.addComment.mockRejectedValue(new Error('fails'));

      await expect(addCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add comment action', async () => {
      const mockAddedComment = new AddedComment({
        id: 'comment-123',
        content: dummyPayload.content,
        owner: dummyPayload.userId,
      });

      mockThreadRepo.isThreadExist.mockResolvedValue(true);
      mockCommentRepo.addComment.mockResolvedValue(mockAddedComment);

      const addedComment = await addCommentUseCase.execute({ ...dummyPayload });
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: dummyPayload.content,
        owner: dummyPayload.userId,
      }));

      expect(mockThreadRepo.isThreadExist).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.isThreadExist).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.addComment).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.addComment).toHaveBeenCalledWith(new NewComment({ ...dummyPayload }));
    });
  });
});