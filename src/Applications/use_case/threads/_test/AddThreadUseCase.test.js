const AddThreadUseCase = require('../AddThreadUseCase');
const AddedThreadEntity = require('../../../../Domains/threads/entities/AddedThreadEntity');
const UserRepository = require('../../../../Domains/users/UserRepository');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
const NewThreadEntity = require('../../../../Domains/threads/entities/NewThreadEntity');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCaseArg1 = 'user-123';
    const useCaseArg2 = {
      title: 'Title',
      body: 'body',
    };

    const mockAddedThread = new AddedThreadEntity({
      id: 'thread-123',
      title: useCaseArg2.title,
      owner: useCaseArg1,
    });

    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();

    // mockUserRepository.verifyUserById = jest.fn()
    //   .mockImplementation(() => Promise.resolve());
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    const addThreadUseCase = new AddThreadUseCase({
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
    });

    const addedThread = await addThreadUseCase.execute(useCaseArg1, useCaseArg2);

    expect(addedThread).toStrictEqual(new AddedThreadEntity({
      id: 'thread-123',
      title: useCaseArg2.title,
      owner: useCaseArg1,
    }));

    // expect(mockUserRepository.verifyUserById)
    //   .toHaveBeenCalledWith(useCaseArg1);

    expect(mockThreadRepository.addThread)
      .toHaveBeenCalledWith(new NewThreadEntity({
        title: useCaseArg2.title,
        body: useCaseArg2.body,
        userId: useCaseArg1,
      }));
  });
});