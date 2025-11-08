const AddedReply = require('../../../../Domains/replies/entities/AddedReply');
const NewReply = require('../../../../Domains/replies/entities/NewReply');
const AddReplyUseCase = require('../AddReplyUseCase');
const CommentRepository = require('../../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../../Domains/replies/ReplyRepository');

const dummyPayload = {
  threadId: 'thread-123',
  commentId: 'comment-123',
  content: 'Sebuah balasan',
  owner: 'user-123',
};

describe('AddReplyUseCase', () => {
  let mockCommentRepo;
  let mockReplyRepo;
  let addReplyUseCase;

  beforeEach(() => {
    mockCommentRepo = new CommentRepository();
    mockCommentRepo.isCommentExist = jest.fn();

    mockReplyRepo = new ReplyRepository();
    mockReplyRepo.addReply = jest.fn();

    addReplyUseCase = new AddReplyUseCase({
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

    it('should throw error when comment not exist', async () => {
      mockCommentRepo.isCommentExist.mockResolvedValue(false);

      await expect(addReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('ADD_REPLY_USE_CASE.COMMENT_NOT_EXIST');

      expect(mockReplyRepo.addReply).not.toHaveBeenCalled();
    });

    it('should propagate error when addReply fails', async () => {
      mockCommentRepo.isCommentExist.mockResolvedValue(true);
      mockReplyRepo.addReply.mockRejectedValue(new Error('fails'));

      await expect(addReplyUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();

      expect(mockReplyRepo.addReply).toHaveBeenCalled();
    });

    it('should throw error when the addedReply is not instance of AddedReply entity', async () => {
      const mockAddedReply = {
        id: 'reply-123',
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      };

      mockCommentRepo.isCommentExist.mockResolvedValue(true);
      mockReplyRepo.addReply.mockResolvedValue(mockAddedReply);

      await expect(addReplyUseCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_REPLY_USE_CASE.ADDED_REPLY_MUST_BE_INSTANCE_OF_ADDED_REPLY_ENTITY');

      expect(mockReplyRepo.addReply).toHaveBeenCalled();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add reply action', async () => {
      const mockAddedReply = new AddedReply({
        id: 'reply-123',
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      });

      mockCommentRepo.isCommentExist.mockResolvedValue(true);
      mockReplyRepo.addReply.mockResolvedValue(mockAddedReply);

      const addedReply = await addReplyUseCase.execute({ ...dummyPayload });

      expect(mockCommentRepo.isCommentExist).toHaveBeenCalledTimes(1);
      expect(mockCommentRepo.isCommentExist).toHaveBeenCalledWith(dummyPayload.commentId, dummyPayload.threadId);
      expect(mockReplyRepo.addReply).toHaveBeenCalledTimes(1);
      expect(mockReplyRepo.addReply).toHaveBeenCalledWith(new NewReply({ ...dummyPayload }));

      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-123',
        content: dummyPayload.content,
        owner: dummyPayload.owner,
      }));
    });
  });
});