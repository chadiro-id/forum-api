const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../../Domains/comments/entities/NewComment');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    content: 'Sebuah komentar',
    owner: 'user-123',
  };

  describe('Fails execution', () => {
    it('should throw error when payload not provided correctly', async () => {
      const addCommentUseCase = new AddCommentUseCase({});

      await expect(addCommentUseCase.execute())
        .rejects.toThrow();
      await expect(addCommentUseCase.execute(''))
        .rejects.toThrow();
      await expect(addCommentUseCase.execute({ ...dummyPayload, content: true }))
        .rejects.toThrow();
    });

    it('should throw error when addedComment is not instance of AddedComment entity', async () => {
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();

      mockThreadRepository.verifyThreadExists = jest.fn().mockResolvedValue();
      mockCommentRepository.addComment = jest.fn().mockResolvedValue({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: 'user-123',
      });

      const useCase = new AddCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
      });

      await expect(useCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_COMMENT_USE_CASE.ADDED_COMMENT_MUST_BE_INSTANCE_OF_ADDED_COMMENT_ENTITY');

      expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepository.addComment).toHaveBeenCalledTimes(1);
      expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new NewComment({
        threadId: dummyPayload.threadId,
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      }));
    });
  });

  describe('Successfull execution', () => {
    it('should correctly orchestrating the add comment action', async () => {
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();

      mockThreadRepository.verifyThreadExists = jest.fn()
        .mockImplementation(() => Promise.resolve());;
      mockCommentRepository.addComment = jest.fn()
        .mockImplementation(() => Promise.resolve(new AddedComment({
          id: 'comment-123',
          content: 'Sebuah komentar',
          owner: 'user-123',
        })));

      const useCase = new AddCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
      });

      const addedComment = await useCase.execute({ ...dummyPayload });

      expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepository.addComment).toHaveBeenCalledTimes(1);
      expect(mockCommentRepository.addComment).toHaveBeenCalledWith(new NewComment({
        threadId: 'thread-123',
        owner: 'user-123',
        content: 'Sebuah komentar',
      }));

      expect(addedComment).toEqual(new AddedComment({
        id: 'comment-123',
        content: 'Sebuah komentar',
        owner: 'user-123',
      }));
    });
  });
});