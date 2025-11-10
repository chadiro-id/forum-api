const AddUserUseCase = require('../AddUserUseCase');
const RegisterUser = require('../../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../../Domains/users/entities/RegisteredUser');
const UserRepository = require('../../../../Domains/users/UserRepository');
const PasswordHash = require('../../../../Applications/security/PasswordHash');

const dummyPayload = {
  username: 'johndoe',
  password: 'supersecret^_@007',
  fullname: 'John Doe',
};

describe('AddUserUseCase', () => {
  const mockUserRepo = new UserRepository();
  mockUserRepo.addUser = jest.fn();
  mockUserRepo.isUsernameExist = jest.fn();

  const mockPasswordHash = new PasswordHash();
  mockPasswordHash.hash = jest.fn();

  const addUserUseCase = new AddUserUseCase({
    userRepository: mockUserRepo,
    passwordHash: mockPasswordHash,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(addUserUseCase.execute({ ...dummyPayload, username: '' }))
        .rejects.toThrow('REGISTER_USER.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when username not available', async () => {
      mockUserRepo.isUsernameExist.mockResolvedValue(true);

      await expect(addUserUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('ADD_USER_USE_CASE.USERNAME_NOT_AVAILABLE');

      expect(mockPasswordHash.hash).not.toHaveBeenCalled();
    });

    it('should propagate error when isUsernameExist fails', async () => {
      mockUserRepo.isUsernameExist.mockRejectedValue(new Error('fails'));

      await expect(addUserUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });

    it('should propagate error when addUser fails', async () => {
      mockUserRepo.isUsernameExist.mockResolvedValue(false);
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockRejectedValue(new Error('fails'));

      await expect(addUserUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });
  });

  describe('Successful execution', () => {
    it('should correctly orchestrating the add user action', async () => {
      const { username, password, fullname } = dummyPayload;

      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123', username, fullname
      });
      const calledRegisterUser = new RegisterUser({
        username, password: 'encrypted_password', fullname
      });

      mockUserRepo.isUsernameExist.mockResolvedValue(false);
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockResolvedValue(mockRegisteredUser);

      const registeredUser = await addUserUseCase.execute({ ...dummyPayload });
      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123', username, fullname
      }));

      expect(mockUserRepo.isUsernameExist).toHaveBeenCalledWith(username);
      expect(mockPasswordHash.hash).toHaveBeenCalledWith(password);
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(calledRegisterUser);
    });
  });
});
