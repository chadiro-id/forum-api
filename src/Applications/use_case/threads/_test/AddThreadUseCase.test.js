const AddThreadUseCase = require('../AddThreadUseCase');
const NewThread = require('../../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');

const dummyPayload = {
  title: 'Sebuah thread',
  body: 'Isi thread',
  userId: 'user-123',
};

describe('AddThreadUseCase', () => {
  const mockThreadRepo = new ThreadRepository();
  mockThreadRepo.addThread = jest.fn();

  const addThreadUseCase = new AddThreadUseCase({
    threadRepository: mockThreadRepo,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(addThreadUseCase.execute({}))
        .rejects.toThrow('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should propagate error when addThread fails', async () => {
      mockThreadRepo.addThread.mockRejectedValue(new Error('fails'));

      await expect(addThreadUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add thread action', async () => {
      const mockAddedThread = new AddedThread({
        id: 'thread-123',
        title: dummyPayload.title,
        owner: dummyPayload.userId,
      });

      mockThreadRepo.addThread.mockResolvedValue(mockAddedThread);

      const addedThread = await addThreadUseCase.execute({ ...dummyPayload });
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: dummyPayload.title,
        owner: dummyPayload.userId,
      }));

      expect(mockThreadRepo.addThread).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.addThread).toHaveBeenCalledWith(new NewThread({ ...dummyPayload }));
    });
  });
});