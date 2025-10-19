const DetailThread = require('../../../../Domains/threads/entities/DetailThread');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
const Comment = require('../../../../Domains/comments/entities/Comment');
const Reply = require('../../../../Domains/replies/entities/Reply');

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
  isDelete: true,
};

const dummyReply1 = {
  id: 'reply-101',
  commentId: 'comment-101',
  content: 'Sebuah balasan 1',
  username: 'whoami',
  date: new Date('2025-10-19T08:21:54.384Z'),
  isDelete: false,
};

const dummyReply2 = {
  id: 'reply-102',
  commentId: 'comment-102',
  content: 'Sebuah balasan 2',
  username: 'johndoe',
  date: new Date('2025-10-19T08:22:54.384Z'),
  isDelete: true,
};

const dummyReply3 = {
  id: 'reply-103',
  commentId: 'comment-101',
  content: 'Sebuah balasan 3',
  username: 'johndoe',
  date: new Date('2025-10-19T08:23:54.384Z'),
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

  describe('Successful executions', () => {
    it('should correctly orchestrating the get detail thread action', async () => {
      const comment1 = new Comment({ ...dummyComment1 });
      const comment2 = new Comment({ ...dummyComment2 });

      const reply1 = new Reply({ ...dummyReply1 });
      const reply2 = new Reply({ ...dummyReply2 });
      const reply3 = new Reply({ ...dummyReply3 });

      mockThreadRepo.getThreadById.mockResolvedValue(new DetailThread({ ...dummyThread }));
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([comment1, comment2]);
      mockReplyRepo.getRepliesByCommentIds.mockResolvedValue([reply1, reply2, reply3]);

      const useCase = new GetDetailThreadUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      const detailThread = await useCase.execute('thread-123');

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
      expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledWith([comment1.id, comment2.id]);

      expect(detailThread).toBeInstanceOf(DetailThread);
      expect(detailThread.id).toEqual(dummyThread.id);
      expect(detailThread.title).toEqual(dummyThread.title);
      expect(detailThread.body).toEqual(dummyThread.body);
      expect(detailThread.date).toEqual(dummyThread.date);
      expect(detailThread.username).toEqual(dummyThread.username);
      expect(detailThread.comments).toHaveLength(2);

      const [threadComment1, threadComment2] = detailThread.comments;

      expect(threadComment1).toBeInstanceOf(Comment);
      expect(threadComment1.id).toEqual(dummyComment1.id);
      expect(threadComment1.content).toEqual(dummyComment1.content);
      expect(threadComment1.date).toEqual(dummyComment1.date);
      expect(threadComment1.username).toEqual(dummyComment1.username);
      expect(threadComment1.isDelete).toBeUndefined();
      expect(threadComment1.replies).toHaveLength(2);

      expect(threadComment2).toBeInstanceOf(Comment);
      expect(threadComment2.id).toEqual(dummyComment2.id);
      expect(threadComment2.content).toEqual('**komentar telah dihapus**');
      expect(threadComment2.date).toEqual(dummyComment2.date);
      expect(threadComment2.username).toEqual(dummyComment2.username);
      expect(threadComment2.isDelete).toBeUndefined();
      expect(threadComment2.replies).toHaveLength(1);

      const [commentReply1, commentReply3] = threadComment1.replies;
      const [commentReply2] = threadComment2.replies;

      expect(commentReply1).toBeInstanceOf(Reply);
      expect(commentReply1.id).toEqual(reply1.id);
      expect(commentReply1.content).toEqual(reply1.content);
      expect(commentReply1.date).toEqual(reply1.date);
      expect(commentReply1.username).toEqual(reply1.username);
      expect(commentReply1.isDelete).toBeUndefined();

      expect(commentReply2).toBeInstanceOf(Reply);
      expect(commentReply2.id).toEqual(reply2.id);
      expect(commentReply2.content).toEqual('**balasan telah dihapus**');
      expect(commentReply2.date).toEqual(reply2.date);
      expect(commentReply2.username).toEqual(reply2.username);
      expect(commentReply2.isDelete).toBeUndefined();

      expect(commentReply3).toBeInstanceOf(Reply);
      expect(commentReply3.id).toEqual(reply3.id);
      expect(commentReply3.content).toEqual(reply3.content);
      expect(commentReply3.date).toEqual(reply3.date);
      expect(commentReply3.username).toEqual(reply3.username);
      expect(commentReply3.isDelete).toBeUndefined();
    });
  });
});