const AddThreadUseCase = require('../AddThreadUseCase');
const NewThread = require('../../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');

const dummyPayload = {
  title: 'Sebuah thread',
  body: 'Isi thread',
  owner: 'user-123',
};

describe('AddThreadUseCase', () => {
  let mockThreadRepo;
  let addThreadUseCase;

  beforeEach(() => {
    mockThreadRepo = new ThreadRepository();
    mockThreadRepo.addThread = jest.fn();

    addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepo,
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(addThreadUseCase.execute()).rejects.toThrow();
      await expect(addThreadUseCase.execute('NewThread')).rejects.toThrow();
      await expect(addThreadUseCase.execute({})).rejects.toThrow();
    });

    it('should propagate error when addThread fails', async () => {
      mockThreadRepo.addThread.mockRejectedValue(new Error('fails'));

      await expect(addThreadUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });

    it('should throw error when addedThread is not instance of AddedThread entity', async () => {
      mockThreadRepo.addThread.mockResolvedValue({
        id: 'thread-123',
        title: 'Sebuah thread',
        owner: 'user-123',
      });

      await expect(addThreadUseCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_THREAD_USE_CASE.ADDED_THREAD_MUST_BE_INSTANCE_OF_ADDED_THREAD_ENTITY');
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add thread action', async () => {
      const mockAddedThread = new AddedThread({
        id: 'thread-123',
        title: dummyPayload.title,
        owner: dummyPayload.owner,
      });

      mockThreadRepo.addThread.mockResolvedValue(mockAddedThread);

      const addedThread = await addThreadUseCase.execute({ ...dummyPayload });

      expect(mockThreadRepo.addThread).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.addThread).toHaveBeenCalledWith(new NewThread({ ...dummyPayload }));

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: dummyPayload.title,
        owner: dummyPayload.owner,
      }));
    });
  });
});