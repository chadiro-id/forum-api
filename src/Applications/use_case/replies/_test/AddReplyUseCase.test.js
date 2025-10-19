const AddedReply = require('../../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../../Domains/replies/entities/NewReply');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  const dummyPayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    content: 'Sebuah balasan',
    owner: 'user-123',
  };

  let mockThreadRepo;
  let mockCommentRepo;
  let mockReplyRepo;

  beforeEach(() => {
    mockThreadRepo = {
      verifyThreadExists: jest.fn(),
    };
    mockCommentRepo = {
      verifyCommentExists: jest.fn(),
    };
    mockReplyRepo = {
      addReply: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      const useCase = new AddReplyUseCase({});

      await expect(useCase.execute()).rejects.toThrow();
      await expect(useCase.execute({})).rejects.toThrow();
      await expect(useCase.execute({ ...dummyPayload, content: 123 })).rejects.toThrow();
    });

    it('should propagate error when thread not exists', async () => {
      mockThreadRepo.verifyThreadExists.mockRejectedValue(new Error('thread not found'));

      const useCase = new AddReplyUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      await expect(useCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentExists).not.toHaveBeenCalled();
      expect(mockReplyRepo.addReply).not.toHaveBeenCalled();
    });

    it('should propagate error when comment not exists', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentExists.mockRejectedValue(new Error('comment not found'));

      const useCase = new AddReplyUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      await expect(useCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledWith(dummyPayload.commentId);
      expect(mockReplyRepo.addReply).not.toHaveBeenCalled();
    });

    it('should throw error when the addedReply is not instance of AddedReply entity', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentExists.mockResolvedValue();
      mockReplyRepo.addReply.mockResolvedValue({
        id: 'reply-123',
        content: 'Sebuah balasan',
        owner: 'user-123',
      });

      const useCase = new AddReplyUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      await expect(useCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_REPLY_USE_CASE.ADDED_REPLY_MUST_BE_INSTANCE_OF_ADDED_REPLY_ENTITY');

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledWith(dummyPayload.commentId);
      expect(mockReplyRepo.addReply).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.addReply).toHaveBeenCalledWith(new NewReply({
        commentId: dummyPayload.commentId,
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      }));
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add reply action', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentExists.mockResolvedValue();
      mockReplyRepo.addReply.mockResolvedValue(new AddedReply({
        id: 'reply-123',
        content: 'Sebuah balasan',
        owner: 'user-123',
      }));

      const useCase = new AddReplyUseCase({
        threadRepository: mockThreadRepo,
        commentRepository: mockCommentRepo,
        replyRepository: mockReplyRepo,
      });

      const addedReply = await useCase.execute({ ...dummyPayload });

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.verifyCommentExists).toHaveBeenCalledWith(dummyPayload.commentId);
      expect(mockReplyRepo.addReply).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.addReply).toHaveBeenCalledWith(new NewReply({
        commentId: dummyPayload.commentId,
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      }));

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: 'Sebuah balasan',
        owner: 'user-123',
      }));
    });
  });
});