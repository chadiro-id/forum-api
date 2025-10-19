const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  let mockThreadRepo;
  let mockCommentRepo;
  let mockReplyRepo;

  beforeEach(() => {
    mockThreadRepo = {
      getThreadById: jest.fn(),
    };
    mockCommentRepo = {
      getCommentsByThreadId: jest.fn(),
    };
    mockReplyRepo = {
      getRepliesByCommentIds: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should propagate error when getThreadById fails', async () => {
      mockThreadRepo.getThreadById.mockRejectedValue(new Error('get thread by id fails'));

      const useCase = new GetDetailThreadUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      await expect(useCase.execute('thread-123')).rejects.toThrow();

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).not.toHaveBeenCalled();
      expect(mockReplyRepo.getRepliesByCommentIds).not.toHaveBeenCalled();
    });

    it('should throw error when returned thread not instance of DetailThread entity', async () => {
      mockThreadRepo.getThreadById.mockResolvedValue({
        id: 'thread-123',
        title: 'Sebuah thread',
        body: 'Isi thread',
        date: new Date(2025, 10, 19, 8),
        username: 'johndoe',
        comments: [],
      });

      const useCase = new GetDetailThreadUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      await expect(useCase.execute('thread-123'))
        .rejects
        .toThrow('GET_DETAIL_THREAD_USE_CASE.DETAIL_THREAD_MUST_BE_INSTANCE_OF_DETAIL_THREAD_ENTITY');

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).not.toHaveBeenCalled();
      expect(mockReplyRepo.getRepliesByCommentIds).not.toHaveBeenCalled();
    });
  });
});