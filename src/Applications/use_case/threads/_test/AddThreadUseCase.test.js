const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../../Domains/threads/entities/AddedThread');

describe('AddThreadUseCase', () => {
  const dummyPayload = {
    title: 'Sebuah thread',
    body: 'Isi thread',
    owner: 'user-123',
  };

  describe('Fails execution', () => {
    it('should throw error when payload not provided correctly', async () => {
      const addThreadUseCase = new AddThreadUseCase({});

      await expect(() => addThreadUseCase.execute())
        .rejects.toThrow();
      await expect(() => addThreadUseCase.execute('NewThread'))
        .rejects.toThrow();
      await expect(() => addThreadUseCase.execute(123))
        .rejects.toThrow();
      await expect(() => addThreadUseCase.execute({}))
        .rejects.toThrow();
    });

    it('should throw error when addedThread is not instance of AddedThread entity', async () => {
      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.addThread = jest.fn().mockResolvedValue({
        id: 'thread-123',
        title: 'Sebuah thread',
        owner: 'user-123',
      });

      const useCase = new AddThreadUseCase({
        threadRepository: mockThreadRepository,
      });

      await expect(useCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_THREAD_USE_CASE.ADDED_THREAD_MUST_BE_INSTANCE_OF_ADDED_THREAD');

      expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
      expect(mockThreadRepository.addThread).toHaveBeenCalledWith(new NewThread({
        title: dummyPayload.title,
        body: dummyPayload.body,
        owner: dummyPayload.owner,
      }));
    });
  });

  describe('Successfull execution', () => {
    it('should correctly orchestrating the add thread action', async () => {
      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.addThread = jest.fn().mockResolvedValue(new AddedThread({
        id: 'thread-123',
        title: 'Sebuah thread',
        owner: 'user-123',
      }));

      const addThreadUseCase = new AddThreadUseCase({
        threadRepository: mockThreadRepository,
      });

      const addedThread = await addThreadUseCase.execute({ ...dummyPayload });

      expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
      expect(mockThreadRepository.addThread).toHaveBeenCalledWith(new NewThread({
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