const AddedComment = require('../../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../../Domains/comments/entities/NewComment');
const AddCommentUseCase = require('../AddCommentUseCase');

const dummyPayload = {
  threadId: 'thread-123',
  content: 'Sebuah komentar',
  owner: 'user-123',
};

describe('AddCommentUseCase', () => {
  let mockThreadRepo;
  let mockCommentRepo;
  let addCommentUseCase;

  beforeEach(() => {
    mockThreadRepo = {
      verifyThreadExists: jest.fn(),
    };
    mockCommentRepo = {
      addComment: jest.fn(),
    };
    addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepo,
      threadRepository: mockThreadRepo,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(addCommentUseCase.execute())
        .rejects.toThrow();
      await expect(addCommentUseCase.execute(123))
        .rejects.toThrow();
      await expect(addCommentUseCase.execute({ ...dummyPayload, content: true }))
        .rejects.toThrow();
    });

    it('should propagate error when thread not exists', async () => {
      mockThreadRepo.verifyThreadExists.mockRejectedValue(new Error('thread not found'));

      await expect(addCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.addComment).not.toHaveBeenCalled();
    });

    it('should propagate error when addComment fails', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.addComment.mockRejectedValue(new Error('add comment fails'));

      await expect(addCommentUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.addComment).toHaveBeenCalledWith(expect.any(NewComment));
    });

    it('should throw error when addedComment is not instance of AddedComment entity', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.addComment.mockResolvedValue({
        id: 'comment-123',
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      });

      await expect(addCommentUseCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_COMMENT_USE_CASE.ADDED_COMMENT_MUST_BE_INSTANCE_OF_ADDED_COMMENT_ENTITY');

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.addComment).toHaveBeenCalledWith(expect.any(NewComment));
    });
  });

  describe('Successful execution', () => {
    it('should correctly orchestrating the add comment action', async () => {
      const mockAddedComment = new AddedComment({
        id: 'comment-123',
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      });

      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.addComment.mockResolvedValue(mockAddedComment);

      const addedComment = await addCommentUseCase.execute({ ...dummyPayload });

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.addComment).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.addComment).toHaveBeenCalledWith(expect.any(NewComment));

      expect(addedComment).toBeInstanceOf(AddedComment);
      expect(addedComment).toEqual(expect.objectContaining({
        id: 'comment-123',
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      }));
    });
  });
});