const ThreadDetails = require('../../../../Domains/threads/entities/ThreadDetails');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');
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

describe('GetDetailThreadUseCase', () => {
  let mockThreadRepo;
  let mockCommentRepo;
  let mockReplyRepo;
  let getThreadDetailsUseCase;

  beforeEach(() => {
    mockThreadRepo = new ThreadRepository();
    mockThreadRepo.getThreadById = jest.fn();

    mockCommentRepo = new CommentRepository();
    mockCommentRepo.getCommentsByThreadId = jest.fn();

    mockReplyRepo = new ReplyRepository();
    mockReplyRepo.getRepliesByCommentIds = jest.fn();

    getThreadDetailsUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should propagate error when thread repository fails', async () => {
      mockThreadRepo.getThreadById.mockRejectedValue(new Error('get thread by id fails'));
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([]);

      await expect(getThreadDetailsUseCase.execute('thread-123')).rejects.toThrow();

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalled();
      expect(mockReplyRepo.getRepliesByCommentIds).not.toHaveBeenCalled();
    });

    it('should propagate error when comment repository fails', async () => {
      mockThreadRepo.getThreadById.mockResolvedValue(new ThreadDetails({ ...dummyThread }));
      mockCommentRepo.getCommentsByThreadId.mockRejectedValue(new Error('get comments by thread id fails'));

      await expect(getThreadDetailsUseCase.execute('thread-123')).rejects.toThrow();

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
      expect(mockReplyRepo.getRepliesByCommentIds).not.toHaveBeenCalled();
    });

    it('should throw error when thread not instance of ThreadDetails entity', async () => {
      mockThreadRepo.getThreadById.mockResolvedValue({ ...dummyThread });
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([]);

      await expect(getThreadDetailsUseCase.execute('thread-123'))
        .rejects
        .toThrow('GET_DETAIL_THREAD_USE_CASE.DETAIL_THREAD_MUST_BE_INSTANCE_OF_DETAIL_THREAD_ENTITY');

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
      expect(mockReplyRepo.getRepliesByCommentIds).not.toHaveBeenCalled();
    });

    it('should propagate error when reply repository fails', async () => {
      const comment1 = new Comment({ ...dummyComments[0] });
      const comment2 = new Comment({ ...dummyComments[1] });

      mockThreadRepo.getThreadById.mockResolvedValue(new ThreadDetails({ ...dummyThread }));
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([comment1, comment2]);
      mockReplyRepo.getRepliesByCommentIds.mockRejectedValue(new Error('get replies fails'));

      await expect(getThreadDetailsUseCase.execute('thread-123')).rejects.toThrow();

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
      expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledWith([comment1.id, comment2.id]);
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the get detail thread action', async () => {
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

      mockThreadRepo.getThreadById.mockResolvedValue(new ThreadDetails({ ...dummyThread }));
      mockCommentRepo.getCommentsByThreadId.mockResolvedValue([...comments]);
      mockReplyRepo.getRepliesByCommentIds.mockResolvedValue([...replies]);

      const detailThread = await getThreadDetailsUseCase.execute('thread-123');

      expect(mockThreadRepo.getThreadById).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.getThreadById).toHaveBeenCalledWith('thread-123');
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.getCommentsByThreadId).toHaveBeenCalledWith('thread-123');
      expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.getRepliesByCommentIds).toHaveBeenCalledWith([...comments.map((c) => c.id)]);

      expect(detailThread).toBeInstanceOf(ThreadDetails);
      expect(detailThread).toMatchObject({
        id: dummyThread.id,
        title: dummyThread.title,
        body: dummyThread.body,
        username: dummyThread.username,
        date: dummyThread.date,
      });
      expect(detailThread.comments).toHaveLength(3);

      const [c1, c2, c3] = detailThread.comments;

      expect(c1.replies).toHaveLength(2);
      expect(c2.replies).toHaveLength(1);
      expect(c3.replies).toHaveLength(0);

      const expectComment = (comment, source) => {
        expect(comment).toBeInstanceOf(Comment);
        expect(comment.id).toEqual(source.id);
        expect(comment.username).toEqual(source.username);
        expect(comment.date).toEqual(source.date);
        const expectedContent = source.isDelete ? '**komentar telah dihapus**' : source.content;
        expect(comment.content).toEqual(expectedContent);
      };

      expectComment(c1, dummyComments[0]);
      expectComment(c2, dummyComments[1]);
      expectComment(c3, dummyComments[2]);

      const expectReply = (reply, source) => {
        expect(reply).toBeInstanceOf(Reply);
        expect(reply.id).toEqual(source.id);
        expect(reply.username).toEqual(source.username);
        expect(reply.date).toEqual(source.date);
        const expectedContent = source.isDelete ? '**balasan telah dihapus**' : source.content;
        expect(reply.content).toEqual(expectedContent);
      };

      expectReply(c1.replies[0], dummyReplies[0]);
      expectReply(c1.replies[1], dummyReplies[2]);
      expectReply(c2.replies[0], dummyReplies[1]);
    });
  });
});