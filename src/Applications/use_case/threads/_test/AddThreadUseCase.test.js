const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../../Domains/threads/entities/AddedThread');

describe('AddThreadUseCase', () => {
  describe('Fails execution', () => {
    it('should throw error when payload not provided correctly', async () => {
      const addThreadUseCase = new AddThreadUseCase({});

      await expect(addThreadUseCase.execute())
        .rejects.toThrow();
      await expect(addThreadUseCase.execute('NewThread'))
        .rejects.toThrow();
      await expect(addThreadUseCase.execute(123))
        .rejects.toThrow();
      await expect(addThreadUseCase.execute({}))
        .rejects.toThrow();
    });
  });

  describe('Successfull execution', () => {
    it('should orchestrating the add thread action correctly', async () => {
      const useCasePayload = {
        title: 'Judul thread',
        body: 'Sebuah thread',
        owner: 'user-123',
      };

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.addThread = jest.fn()
        .mockResolvedValue(new AddedThread({
          id: 'thread-123',
          title: useCasePayload.title,
          owner: useCasePayload.owner,
        }));

      const addThreadUseCase = new AddThreadUseCase({
        threadRepository: mockThreadRepository,
      });

      const addedThread = await addThreadUseCase.execute(useCasePayload);

      expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
      expect(mockThreadRepository.addThread).toHaveBeenCalledWith(new NewThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      }));

      expect(addedThread).toBeInstanceOf(AddedThread);
      expect(Object.keys(addedThread)).toHaveLength(3);
      expect(addedThread.id).toEqual('thread-123');
      expect(addedThread.title).toEqual('Judul thread');
      expect(addedThread.owner).toEqual('user-123');
    });
  });
});