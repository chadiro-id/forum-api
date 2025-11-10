const ThreadDetails = require('../../../../Domains/threads/entities/ThreadDetails');
const GetThreadDetailsUseCase = require('../GetThreadDetailsUseCase');
const Comment = require('../../../../Domains/comments/entities/Comment');
const Reply = require('../../../../Domains/replies/entities/Reply');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');

const dummyThread = {
  id: 'thread-123',
  title: 'Sebuah thread',
  body: 'Isi thread',
  date: new Date('2025-10-19T08:00:54.384Z'),
  username: 'johndoe',
  comments: [],
};
const dummyComments = [
  {
    id: 'comment-101',
    content: 'Sebuah komentar 1',
    date: new Date('2025-10-19T08:10:54.384Z'),
    username: 'johndoe',
    isDelete: false,
  },
  {
    id: 'comment-102',
    content: 'Sebuah komentar 2',
    date: new Date('2025-10-19T08:20:54.384Z'),
    username: 'whoami',
    isDelete: true,
  },
  {
    id: 'comment-103',
    content: 'Sebuah komentar 3',
    date: new Date('2025-10-19T08:30:54.384Z'),
    username: 'whoami',
    isDelete: true,
  },
];
const dummyReplies = [
  {
    id: 'reply-101',
    commentId: 'comment-101',
    content: 'Sebuah balasan 1',
    username: 'whoami',
    date: new Date('2025-10-19T08:21:54.384Z'),
    isDelete: false,
  },
  {
    id: 'reply-102',
    commentId: 'comment-102',
    content: 'Sebuah balasan 2',
    username: 'johndoe',
    date: new Date('2025-10-19T08:22:54.384Z'),
    isDelete: true,
  },
  {
    id: 'reply-103',
    commentId: 'comment-101',
    content: 'Sebuah balasan 3',
    username: 'johndoe',
    date: new Date('2025-10-19T08:23:54.384Z'),
    isDelete: false,
  },
];

describe('GetThreadDetailsUseCase', () => {
  const mockThreadRepo = new ThreadRepository();
  mockThreadRepo.getThreadDetails = jest.fn();

  const mockCommentRepo = new CommentRepository();
  mockCommentRepo.getCommentsByThreadId = jest.fn();

  const mockReplyRepo = new ReplyRepository();
  mockReplyRepo.getRepliesByCommentIds = jest.fn();

  const getThreadDetailsUseCase = new GetThreadDetailsUseCase({
    threadRepository: mockThreadRepo,
    commentRepository: mockCommentRepo,
    replyRepository: mockReplyRepo,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should propagate error when getThreadDetails fails', async () => {
      mockThreadRepo.getThreadDetails.mockRejectedValue(new Error('fails'));
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([]);

      await expect(getThreadDetailsUseCase.execute('thread-123'))
        .rejects.toThrow();

      expect(mockReplyRepo.getRepliesByCommentIds).not.toHaveBeenCalled();
    });

    it('should throw error when thread not exist', async () => {
      mockThreadRepo.getThreadDetails.mockResolvedValue(null);

      await expect(getThreadDetailsUseCase.execute('thread-123'))
        .rejects.toThrow('GET_THREAD_DETAILS_USE_CASE.THREAD_NOT_FOUND');
    });

    it('should throw error when thread not instance of ThreadDetails entity', async () => {
      mockThreadRepo.getThreadDetails.mockResolvedValue({ ...dummyThread });
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([]);

      await expect(getThreadDetailsUseCase.execute('thread-123'))
        .rejects
        .toThrow('GET_THREAD_DETAILS_USE_CASE.THREAD_MUST_BE_INSTANCE_OF_THREAD_DETAILS_ENTITY');

      expect(mockReplyRepo.getRepliesByCommentIds).not.toHaveBeenCalled();
    });

    it('should propagate error when getCommentsByThreadId fails', async () => {
      mockThreadRepo.getThreadDetails.mockResolvedValue(new ThreadDetails({ ...dummyThread }));
      mockCommentRepo.getCommentsByThreadId.mockRejectedValue(new Error('fails'));

      await expect(getThreadDetailsUseCase.execute('thread-123'))
        .rejects.toThrow();

      expect(mockReplyRepo.getRepliesByCommentIds).not.toHaveBeenCalled();
    });

    it('should propagate error when getRepliesByCommentIds fails', async () => {
      const comment1 = new Comment({ ...dummyComments[0] });
      const comment2 = new Comment({ ...dummyComments[1] });

      mockThreadRepo.getThreadDetails.mockResolvedValue(new ThreadDetails({ ...dummyThread }));
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([comment1, comment2]);
      mockReplyRepo.getRepliesByCommentIds.mockRejectedValue(new Error('fails'));

      await expect(getThreadDetailsUseCase.execute('thread-123'))
        .rejects.toThrow();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the get thread details action', async () => {
      const comments = [
        new Comment({ ...dummyComments[0] }),
        new Comment({ ...dummyComments[1] }),
        new Comment({ ...dummyComments[2] }),
      ];
      const replies = [
        new Reply({ ...dummyReplies[0] }),
        new Reply({ ...dummyReplies[1] }),
        new Reply({ ...dummyReplies[2] }),
      ];

      const replyGroup = Object.groupBy(replies, ({ commentId }) => commentId);
      const expectedComments = comments.map((c) => {
        c.replies = replyGroup[c.id] || [];
        return c;
      });
      const expectedThread = new ThreadDetails({ ...dummyThread });
      expectedThread.comments = expectedComments;

      mockThreadRepo.getThreadDetails.mockResolvedValue(new ThreadDetails({ ...dummyThread }));
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([...comments]);
      mockReplyRepo.getRepliesByCommentIds.mockResolvedValue([...replies]);

      const threadDetails = await getThreadDetailsUseCase.execute('thread-123');
      expect(threadDetails).toStrictEqual(expectedThread);

      expect(mockThreadRepo.getThreadDetails).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.getThreadDetails).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
      expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledWith([...comments.map((c) => c.id)]);
    });
  });
});