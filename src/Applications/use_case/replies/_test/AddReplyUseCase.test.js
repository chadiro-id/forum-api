const AddedReply = require('../../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../../Domains/replies/entities/NewReply');
const AddReplyUseCase = require('../AddReplyUseCase');

const dummyPayload = {
  threadId: 'thread-123',
  commentId: 'comment-123',
  content: 'Sebuah balasan',
  owner: 'user-123',
};

describe('AddReplyUseCase', () => {
  let mockThreadRepo;
  let mockCommentRepo;
  let mockReplyRepo;
  let addReplyUseCase;

  beforeEach(() => {
    mockThreadRepo = {
      verifyThreadExists: jest.fn(),
    };
    mockCommentRepo = {
      verifyCommentBelongToThread: jest.fn(),
    };
    mockReplyRepo = {
      addReply: jest.fn(),
    };
    addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepo,
      commentRepository: mockCommentRepo,
      replyRepository: mockReplyRepo,
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(addReplyUseCase.execute())
        .rejects.toThrow();
      await expect(addReplyUseCase.execute({}))
        .rejects.toThrow();
      await expect(addReplyUseCase.execute({ ...dummyPayload, content: 123 }))
        .rejects.toThrow();
    });

    it('should propagate error when thread not exists', async () => {
      mockThreadRepo.verifyThreadExists.mockRejectedValue(new Error('thread not found'));

      await expect(addReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentBelongToThread).not.toHaveBeenCalled();
      expect(mockReplyRepo.addReply).not.toHaveBeenCalled();
    });

    it('should propagate error when comment verification fails', async () => {
      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentBelongToThread.mockRejectedValue(new Error('comment not found'));

      await expect(addReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentBelongToThread).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.threadId);
      expect(mockReplyRepo.addReply).not.toHaveBeenCalled();
    });

    it('should throw error when the addedReply is not instance of AddedReply entity', async () => {
      const mockAddedReply = {
        id: 'reply-123',
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      };

      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentBelongToThread.mockResolvedValue();
      mockReplyRepo.addReply.mockResolvedValue(mockAddedReply);

      await expect(addReplyUseCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_REPLY_USE_CASE.ADDED_REPLY_MUST_BE_INSTANCE_OF_ADDED_REPLY_ENTITY');

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentBelongToThread).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.threadId);
      expect(mockReplyRepo.addReply).toHaveBeenCalledWith(expect.any(NewReply));
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add reply action', async () => {
      const expectedAddedReply = new AddedReply({
        id: 'reply-123',
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      });
      const mockAddedReply = new AddedReply({
        id: 'reply-123',
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      });

      mockThreadRepo.verifyThreadExists.mockResolvedValue();
      mockCommentRepo.verifyCommentBelongToThread.mockResolvedValue();
      mockReplyRepo.addReply.mockResolvedValue(mockAddedReply);

      const addedReply = await addReplyUseCase.execute({ ...dummyPayload });

      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.verifyThreadExists).toHaveBeenCalledWith(dummyPayload.threadId);
      expect(mockCommentRepo.verifyCommentBelongToThread).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.verifyCommentBelongToThread).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.threadId);
      expect(mockReplyRepo.addReply).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.addReply).toHaveBeenCalledWith(expect.any(NewReply));

      expect(addedReply).toStrictEqual(expectedAddedReply);
    });
  });
});