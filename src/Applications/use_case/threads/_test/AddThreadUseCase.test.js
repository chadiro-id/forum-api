const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const NewThread = require('../../../../Domains/threads/entities/NewThread');

describe('AddThreadUseCase', () => {
  describe('Fails execution', () => {
    it('should throw error when payload not provided correctly', async () => {
      const addThreadUseCase = new AddThreadUseCase({});

      await expect(addThreadUseCase.execute())
        .rejects
        .toThrow('ADD_THREAD_USE_CASE.PAYLOAD_MUST_BE_INSTANCE_OF_NEWTHREAD');
      await expect(addThreadUseCase.execute('NewThread'))
        .rejects
        .toThrow('ADD_THREAD_USE_CASE.PAYLOAD_MUST_BE_INSTANCE_OF_NEWTHREAD');
      await expect(addThreadUseCase.execute(123))
        .rejects
        .toThrow('ADD_THREAD_USE_CASE.PAYLOAD_MUST_BE_INSTANCE_OF_NEWTHREAD');
      await expect(addThreadUseCase.execute({}))
        .rejects
        .toThrow('ADD_THREAD_USE_CASE.PAYLOAD_MUST_BE_INSTANCE_OF_NEWTHREAD');
    });
  });

  describe('Successfull execution', () => {
    it('should orchestrating the add thread action correctly', async () => {
      const payload = new NewThread({
        title: 'Something thread title',
        body: 'Something thread body',
        owner: 'user-123',
      });

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve('thread-123'));

      const addThreadUseCase = new AddThreadUseCase({
        threadRepository: mockThreadRepository,
      });

      const addedThreadId = await addThreadUseCase.execute(payload);

      expect(mockThreadRepository.addThread).toHaveBeenCalledTimes(1);
      expect(mockThreadRepository.addThread).toHaveBeenCalledWith({
        title: payload.title,
        body: payload.body,
        owner_id: payload.owner,
      });

      expect(addedThreadId).toEqual('thread-123');
    });
  });
});