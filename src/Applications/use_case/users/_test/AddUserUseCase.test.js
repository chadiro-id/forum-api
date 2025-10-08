const AddUserUseCase = require('../AddUserUseCase');
const PasswordHash = require('../../../security/PasswordHash');
const UserRepository = require('../../../../Domains/users/UserRepository');
const RegisterUserEntity = require('../../../../Domains/users/entities/RegisterUserEntity');
const RegisteredUserEntity = require('../../../../Domains/users/entities/RegisteredUserEntity');

describe('AddUserUseCase', () => {
  describe('when executed', () => {
    it('should orchestrating the add user action correctly', async () => {
      const useCasePayload = {
        username: 'forumapi',
        password: 'super_secret',
        fullname: 'Forum Api',
      };

      const mockRegisteredUser = new RegisteredUserEntity({
        id: 'user-123',
        username: useCasePayload.username,
        fullname: useCasePayload.fullname,
      });

      const mockUserRepository = new UserRepository();
      const mockPasswordHash = new PasswordHash();

      mockUserRepository.verifyAvailableUsername = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockPasswordHash.hash = jest.fn()
        .mockImplementation(() => Promise.resolve('encrypted_password'));
      mockUserRepository.addUser = jest.fn()
        .mockImplementation(() => Promise.resolve(mockRegisteredUser));

      const useCase = new AddUserUseCase({
        userRepository: mockUserRepository,
        passwordHash: mockPasswordHash,
      });

      const registeredUser = await useCase.execute(useCasePayload);

      expect(registeredUser).toStrictEqual(new RegisteredUserEntity({
        id: 'user-123',
        username: useCasePayload.username,
        fullname: useCasePayload.fullname,
      }));

      expect(mockUserRepository.verifyAvailableUsername).toHaveBeenCalledWith(useCasePayload.username);
      expect(mockPasswordHash.hash).toHaveBeenCalledWith(useCasePayload.password);
      expect(mockUserRepository.addUser).toHaveBeenCalledWith(new RegisterUserEntity({
        username: useCasePayload.username,
        password: 'encrypted_password',
        fullname: useCasePayload.fullname,
      }));
    });
  });
});
