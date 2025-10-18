const AddUserUseCase = require('../AddUserUseCase');
const RegisterUser = require('../../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../../Domains/users/entities/RegisteredUser');

describe('AddUserUseCase', () => {
  const dummyPayload = {
    username: 'johndoe',
    password: 'supersecret^_@007',
    fullname: 'John Doe',
  };

  let mockUserRepo;
  let mockPasswordHash;

  beforeEach(() => {
    mockUserRepo = {
      addUser: jest.fn(),
      verifyAvailableUsername: jest.fn(),
    };

    mockPasswordHash = {
      hash: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      const useCase = new AddUserUseCase({});

      await expect(useCase.execute()).rejects.toThrow();
      await expect(useCase.execute([])).rejects.toThrow();
      await expect(useCase.execute({ ...dummyPayload, username: 'who am i' })).rejects.toThrow();
    });

    it('should propagate error when username already taken', async () => {
      mockUserRepo.verifyAvailableUsername.mockRejectedValue(new Error('username already taken'));

      const useCase = new AddUserUseCase({
        userRepository: mockUserRepo,
        passwordHash: mockPasswordHash,
      });

      await expect(useCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.hash).not.toHaveBeenCalled();
    });

    it('should propagate error when addUser fails', async () => {
      mockUserRepo.verifyAvailableUsername.mockResolvedValue();
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockRejectedValue(new Error('Add user fails'));

      const useCase = new AddUserUseCase({
        userRepository: mockUserRepo,
        passwordHash: mockPasswordHash,
      });

      await expect(useCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.hash).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.addUser).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(new RegisterUser({
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
        password: 'encrypted_password',
      }));
    });

    it('should throw error when the registeredUser not an instance of RegisteredUser entity', async () => {
      mockUserRepo.verifyAvailableUsername.mockResolvedValue();
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockResolvedValue({
        id: 'user-123',
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      });

      const useCase = new AddUserUseCase({
        userRepository: mockUserRepo,
        passwordHash: mockPasswordHash,
      });

      await expect(useCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_USER_USE_CASE.REGISTERED_USER_MUST_BE_INSTANCE_OF_REGISTERED_USER_ENTITY');

      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.hash).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.addUser).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(new RegisterUser({
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
        password: 'encrypted_password',
      }));
    });
  });

  describe('Successful execution', () => {
    it('should orchestrating the add user action correctly', async () => {
      mockUserRepo.verifyAvailableUsername.mockResolvedValue();
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockResolvedValue(new RegisteredUser({
        id: 'user-123',
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      }));

      const useCase = new AddUserUseCase({
        userRepository: mockUserRepo,
        passwordHash: mockPasswordHash,
      });

      const registeredUser = await useCase.execute({ ...dummyPayload });

      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123',
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      }));

      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.hash).toHaveBeenCalledWith(dummyPayload.password);
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(new RegisterUser({
        username: dummyPayload.username,
        password: 'encrypted_password',
        fullname: dummyPayload.fullname,
      }));
    });
  });
});
