const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../../Domains/comments/entities/NewComment');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  describe('Fails execution', () => {
    it('should throw error when the given payload is not an instance of NewComment', async () => {
      const addCommentUseCase = new AddCommentUseCase({});

      await expect(addCommentUseCase.execute())
        .rejects.toThrow();
      await expect(addCommentUseCase.execute(''))
        .rejects.toThrow();
      await expect(addCommentUseCase.execute({}))
        .rejects.toThrow();
    });
  });

  describe('Successfull execution', () => {
    it('should correctly orchestrating the add comment action', async () => {
      const payload = {
        threadId: 'thread-123',
        content: 'Sebuah komentar',
        owner: 'user-123',
      };

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

      const addCommentUseCase = new AddCommentUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
      });

      const addedComment = await addCommentUseCase.execute(payload);

      expect(mockThreadRepository.verifyThreadExists).toHaveBeenCalledTimes(1);
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