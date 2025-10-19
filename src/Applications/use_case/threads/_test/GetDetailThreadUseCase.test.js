const DetailThread = require('../../../../Domains/threads/entities/DetailThread');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const Comment = require('../../../../Domains/comments/entities/Comment');

const dummyThread = {
  id: 'thread-123',
  title: 'Sebuah thread',
  body: 'Isi thread',
  date: new Date('2025-10-19T08:00:54.384Z'),
  username: 'johndoe',
  comments: [],
};

const dummyComment1 = {
  id: 'comment-101',
  content: 'Sebuah komentar 1',
  date: new Date('2025-10-19T08:10:54.384Z'),
  username: 'johndoe',
  isDelete: false,
};

const dummyComment2 = {
  id: 'comment-102',
  content: 'Sebuah komentar 2',
  date: new Date('2025-10-19T08:20:54.384Z'),
  username: 'whoami',
  isDelete: false,
};

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
      mockThreadRepo.getThreadById.mockResolvedValue({ ...dummyThread });

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

    it('should propagate error when getCommentsByThreadId fails', async () => {
      mockThreadRepo.getThreadById.mockResolvedValue(new DetailThread({ ...dummyThread }));
      mockCommentRepo.getCommentsByThreadId.mockRejectedValue(new Error('get comments by thread id fails'));

      const useCase = new GetDetailThreadUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      await expect(useCase.execute('thread-123')).rejects.toThrow();

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
      expect(mockReplyRepo.getRepliesByCommentIds).not.toHaveBeenCalled();
    });

    it('should propagate error when getRepliesByCommentIds fails', async () => {
      const comment1 = new Comment({ ...dummyComment1 });
      const comment2 = new Comment({ ...dummyComment2 });

      mockThreadRepo.getThreadById.mockResolvedValue(new DetailThread({ ...dummyThread }));
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([comment1, comment2]);
      mockReplyRepo.getRepliesByCommentIds.mockRejectedValue(new Error('get replies fails'));

      const useCase = new GetDetailThreadUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      await expect(useCase.execute('thread-123')).rejects.toThrow();

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
      expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledWith([comment1.id, comment2.id]);
    });
  });
});