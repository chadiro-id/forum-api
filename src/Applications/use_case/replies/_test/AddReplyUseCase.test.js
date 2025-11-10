const AddedReply = require('../../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../../Domains/replies/entities/NewReply');
const AddReplyUseCase = require('../AddReplyUseCase');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');

const dummyPayload = {
  threadId: 'thread-123',
  commentId: 'comment-123',
  content: 'Sebuah balasan',
  userId: 'user-123',
};

describe('AddReplyUseCase', () => {
  const mockCommentRepo = new CommentRepository();
  mockCommentRepo.isCommentExist = jest.fn();

  const mockReplyRepo = new ReplyRepository();
  mockReplyRepo.addReply = jest.fn();

  const addReplyUseCase = new AddReplyUseCase({
    commentRepository: mockCommentRepo,
    replyRepository: mockReplyRepo,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(addReplyUseCase.execute({}))
        .rejects.toThrow('NEW_REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when comment not exist', async () => {
      mockCommentRepo.isCommentExist.mockResolvedValue(false);

      await expect(addReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('ADD_REPLY_USE_CASE.COMMENT_NOT_FOUND');

      expect(mockReplyRepo.addReply).not.toHaveBeenCalled();
    });

    it('should propagate error when isCommentExist fails', async () => {
      mockCommentRepo.isCommentExist.mockRejectedValue(new Error('fails'));

      await expect(addReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });

    it('should propagate error when addReply fails', async () => {
      mockCommentRepo.isCommentExist.mockResolvedValue(true);
      mockReplyRepo.addReply.mockRejectedValue(new Error('fails'));

      await expect(addReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add reply action', async () => {
      const mockAddedReply = new AddedReply({
        id: 'reply-123',
        content: dummyPayload.content,
        owner: dummyPayload.userId,
      });

      mockCommentRepo.isCommentExist.mockResolvedValue(true);
      mockReplyRepo.addReply.mockResolvedValue(mockAddedReply);

      const addedReply = await addReplyUseCase.execute({ ...dummyPayload });
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: dummyPayload.content,
        owner: dummyPayload.userId,
      }));

      expect(mockCommentRepo.isCommentExist).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.isCommentExist).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.threadId);
      expect(mockReplyRepo.addReply).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.addReply).toHaveBeenCalledWith(new NewReply({ ...dummyPayload }));
    });
  });
});