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
  let mockUserRepo;
  let mockPasswordHash;
  let addUserUseCase;

  beforeEach(() => {
    mockUserRepo = new UserRepository();
    mockUserRepo.addUser = jest.fn();
    mockUserRepo.isUsernameExist = jest.fn();

    mockPasswordHash = new PasswordHash();
    mockPasswordHash.hash = jest.fn();

    addUserUseCase = new AddUserUseCase({
      userRepository: mockUserRepo,
      passwordHash: mockPasswordHash,
    });
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

    it('should propagate error when addUser fails', async () => {
      mockUserRepo.isUsernameExist.mockResolvedValue(false);
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockRejectedValue(new Error('fails'));

      await expect(addUserUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });

    it('should throw error when the registeredUser not an instance of RegisteredUser entity', async () => {
      const mockRegisteredUser = {
        id: 'user-123',
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      };

      mockUserRepo.isUsernameExist.mockResolvedValue(false);
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockResolvedValue(mockRegisteredUser);

      await expect(addUserUseCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_USER_USE_CASE.REGISTERED_USER_MUST_BE_INSTANCE_OF_REGISTERED_USER_ENTITY');
    });
  });

  describe('Successful execution', () => {
    it('should correctly orchestrating the add user action', async () => {
      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      });

      mockUserRepo.isUsernameExist.mockResolvedValue(false);
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockResolvedValue(mockRegisteredUser);

      const registeredUser = await addUserUseCase.execute({ ...dummyPayload });

      expect(mockUserRepo.isUsernameExist).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.hash).toHaveBeenCalledWith(dummyPayload.password);
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(new RegisterUser({
        username: dummyPayload.username,
        password: 'encrypted_password',
        fullname: dummyPayload.fullname,
      }));

      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123',
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      }));
    });
  });
});
