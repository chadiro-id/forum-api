const AddThreadUseCase = require('../AddThreadUseCase');
const NewThread = require('../../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../../Domains/threads/entities/AddedThread');

describe('AddThreadUseCase', () => {
  const dummyPayload = {
    title: 'Sebuah thread',
    body: 'Isi thread',
    owner: 'user-123',
  };

  let mockThreadRepo;

  beforeEach(() => {
    mockThreadRepo = {
      addThread: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      const useCase = new AddThreadUseCase({});

      await expect(useCase.execute()).rejects.toThrow();
      await expect(useCase.execute('NewThread')).rejects.toThrow();
      await expect(useCase.execute(123)).rejects.toThrow();
      await expect(useCase.execute({})).rejects.toThrow();
    });

    it('should propagate error when add thread fails', async () => {
      mockThreadRepo.addThread.mockRejectedValue(new Error('add thead fails'));

      const useCase = new AddThreadUseCase({
        threadRepository: mockThreadRepo,
      });

      await expect(useCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockThreadRepo.addThread).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.addThread).toHaveBeenCalledWith(new NewThread({
        title: dummyPayload.title,
        body: dummyPayload.body,
        owner: dummyPayload.owner,
      }));
    });

    it('should throw error when addedThread is not instance of AddedThread entity', async () => {
      mockThreadRepo.addThread.mockResolvedValue({
        id: 'thread-123',
        title: 'Sebuah thread',
        owner: 'user-123',
      });

      const useCase = new AddThreadUseCase({
        threadRepository: mockThreadRepo,
      });

      await expect(useCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_THREAD_USE_CASE.ADDED_THREAD_MUST_BE_INSTANCE_OF_ADDED_THREAD_ENTITY');

      expect(mockThreadRepo.addThread).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.addThread).toHaveBeenCalledWith(new NewThread({
        title: dummyPayload.title,
        body: dummyPayload.body,
        owner: dummyPayload.owner,
      }));
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add thread action', async () => {
      mockThreadRepo.addThread.mockResolvedValue(new AddedThread({
        id: 'thread-123',
        title: 'Sebuah thread',
        owner: 'user-123',
      }));

      const useCase = new AddThreadUseCase({
        threadRepository: mockThreadRepo,
      });

      const addedThread = await useCase.execute({ ...dummyPayload });

      expect(mockThreadRepo.addThread).toHaveBeenCalledTimes(1);
      expect(mockThreadRepo.addThread).toHaveBeenCalledWith(new NewThread({
        title: dummyPayload.title,
        body: dummyPayload.body,
        owner: dummyPayload.owner,
      }));

      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(Object.keys(addedThread)).toHaveLength(3);
      expect(addedThread.id).toEqual('thread-123');
      expect(addedThread.title).toEqual('Sebuah thread');
      expect(addedThread.owner).toEqual('user-123');
    });
  });
});