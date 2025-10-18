const AddedComment = require('../../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../../Domains/comments/entities/NewComment');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    content: 'Sebuah komentar',
    owner: 'user-123',
  };

  let mockThreadRepo;
  let mockCommentRepo;

  beforeEach(() => {
    mockThreadRepo = {
      verifyThreadExists: jest.fn(),
    };
    mockCommentRepo = {
      addComment: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      const useCase = new AddCommentUseCase({});

      await expect(useCase.execute()).rejects.toThrow();
      await expect(useCase.execute(123)).rejects.toThrow();
      await expect(useCase.execute({ ...dummyPayload, content: true })).rejects.toThrow();
    });

    it('should propagate error when thread not exists', async () => {
      mockThreadRepo.verifyThreadExists.mockRejectedValue(new Error('thread not found'));

      const useCase = new AddCommentUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
      });

      await expect(useCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.addComment).not.toHaveBeenCalled();
    });

    it('should propagate error when addComment fails', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.addComment.mockRejectedValue(new Error('add comment fails'));

      const useCase = new AddCommentUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
      });

      await expect(useCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.addComment).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.addComment).toHaveBeenCalledWith(new NewComment({
        threadId: dummyPayload.threadId,
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      }));
    });

    it('should throw error when addedComment is not instance of AddedComment entity', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.addComment.mockResolvedValue({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: 'user-123',
      });

      const useCase = new AddCommentUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
      });

      await expect(useCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_COMMENT_USE_CASE.ADDED_COMMENT_MUST_BE_INSTANCE_OF_ADDED_COMMENT_ENTITY');

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.addComment).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.addComment).toHaveBeenCalledWith(new NewComment({
        threadId: dummyPayload.threadId,
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      }));
    });
  });

  describe('Successful execution', () => {
    it('should correctly orchestrating the add comment action', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.addComment.mockResolvedValue(new AddedComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: 'user-123',
      }));

      const useCase = new AddCommentUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
      });

      const addedComment = await useCase.execute({ ...dummyPayload });

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.addComment).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.addComment).toHaveBeenCalledWith(new NewComment({
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'Sebuah komentar',
      }));

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: 'user-123',
      }));
    });
  });
});