const AddUserUseCase = require('../AddUserUseCase');
const RegisterUser = require('../../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../../Domains/users/entities/RegisteredUser');

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
    mockUserRepo = {
      addUser: jest.fn(),
      verifyAvailableUsername: jest.fn(),
    };
    mockPasswordHash = {
      hash: jest.fn(),
    };

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
      await expect(addUserUseCase.execute())
        .rejects.toThrow();
      await expect(addUserUseCase.execute([]))
        .rejects.toThrow();
      await expect(addUserUseCase.execute({ ...dummyPayload, username: 'who am i' }))
        .rejects.toThrow();
    });

    it('should propagate error when username already taken', async () => {
      mockUserRepo.verifyAvailableUsername.mockRejectedValue(new Error('username already taken'));

      await expect(addUserUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.hash).not.toHaveBeenCalled();
    });

    it('should propagate error when addUser fails', async () => {
      mockUserRepo.verifyAvailableUsername.mockResolvedValue();
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockRejectedValue(new Error('Add user fails'));

      await expect(addUserUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.hash).toHaveBeenCalledWith(dummyPayload.password);
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(expect.any(RegisterUser));
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: dummyPayload.username,
          password: 'encrypted_password',
          fullname: dummyPayload.fullname,
        })
      );
    });

    it('should throw error when the registeredUser not an instance of RegisteredUser entity', async () => {
      const mockRegisteredUser = {
        id: 'user-123',
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      };

      mockUserRepo.verifyAvailableUsername.mockResolvedValue();
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockResolvedValue(mockRegisteredUser);

      await expect(addUserUseCase.execute({ ...dummyPayload }))
        .rejects
        .toThrow('ADD_USER_USE_CASE.REGISTERED_USER_MUST_BE_INSTANCE_OF_REGISTERED_USER_ENTITY');

      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.hash).toHaveBeenCalledWith(dummyPayload.password);
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(expect.any(RegisterUser));
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: dummyPayload.username,
          password: 'encrypted_password',
          fullname: dummyPayload.fullname,
        })
      );
    });
  });

  describe('Successful execution', () => {
    it('should correctly orchestrating the add user action', async () => {
      const mockRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      });

      mockUserRepo.verifyAvailableUsername.mockResolvedValue();
      mockPasswordHash.hash.mockResolvedValue('encrypted_password');
      mockUserRepo.addUser.mockResolvedValue(mockRegisteredUser);

      const registeredUser = await addUserUseCase.execute({ ...dummyPayload });

      expect(mockUserRepo.verifyAvailableUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.hash).toHaveBeenCalledWith(dummyPayload.password);
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(expect.any(RegisterUser));
      expect(mockUserRepo.addUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: dummyPayload.username,
          password: 'encrypted_password',
          fullname: dummyPayload.fullname,
        })
      );

      expect(registeredUser).toBeInstanceOf(RegisteredUser);
      expect(registeredUser).toEqual(expect.objectContaining({
        id: 'user-123',
        username: dummyPayload.username,
        fullname: dummyPayload.fullname,
      }));
    });
  });
});
