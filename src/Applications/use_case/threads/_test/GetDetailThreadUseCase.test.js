const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  describe('Fails execution', () => {
    it('should throw error when the returned thread from repo is not instance of DetailThread entity', async () => {
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();

      mockThreadRepository.getThreadById = jest.fn().mockResolvedValue({
        id: 'thread-123',
        title: 'Sebuah thread',
        body: 'Isi thread',
        date: new Date(),
        username: 'johndoe',
        comments: [],
      });
      mockCommentRepository.getCommentsByThreadId = jest.fn();
      mockReplyRepository.getRepliesByCommentIds = jest.fn();

      const useCase = new GetDetailThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
      });

      await expect(useCase.execute('thread-123'))
        .rejects
        .toThrow('GET_DETAIL_THREAD_USE_CASE.DETAIL_THREAD_MUST_BE_INSTANCE_OF_DETAIL_THREAD_ENTITY');

      expect(mockThreadRepository.getThreadById).toHaveBeenCalledTimes(1);
      expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepository.getCommentsByThreadId).not.toHaveBeenCalled();
      expect(mockReplyRepository.getRepliesByCommentIds).not.toHaveBeenCalled();
    });
  });
});