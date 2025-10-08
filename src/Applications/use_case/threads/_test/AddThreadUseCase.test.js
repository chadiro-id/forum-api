const AddThreadUseCase = require('../AddThreadUseCase');
const AddedThreadEntity = require('../../../../Domains/threads/entities/AddedThreadEntity');
const UserRepository = require('../../../../Domains/users/UserRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const NewThreadEntity = require('../../../../Domains/threads/entities/NewThreadEntity');

describe('AddThreadUseCase', () => {
  describe('when executed', () => {
    it('should orchestrating the add thread action correctly', async () => {
      const payload = {
        title: 'Title',
        body: 'body',
        owner: 'user-123',
      };

      const mockAddedThread = new AddedThreadEntity({
        id: 'thread-123',
        title: payload.title,
        owner: payload.owner,
      });

      const mockUserRepository = new UserRepository();
      const mockThreadRepository = new ThreadRepository();

      mockUserRepository.verifyUserById = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockThreadRepository.addThread = jest.fn()
        .mockImplementation(() => Promise.resolve(mockAddedThread));

      const addThreadUseCase = new AddThreadUseCase({
        userRepository: mockUserRepository,
        threadRepository: mockThreadRepository,
      });

      const addedThread = await addThreadUseCase.execute(payload);

      expect(addedThread).toStrictEqual(new AddedThreadEntity({
        id: 'thread-123',
        title: payload.title,
        owner: payload.owner,
      }));

      expect(mockUserRepository.verifyUserById)
        .toHaveBeenCalledWith(payload.owner);

      expect(mockThreadRepository.addThread)
        .toHaveBeenCalledWith(new NewThreadEntity({
          title: payload.title,
          body: payload.body,
          owner: payload.owner,
        }));
    });
  });
});