const UserAuthentication = require('../../../../Domains/authentications/entities/UserAuthentication');
const AddAuthenticationUseCase = require('../AddAuthenticationUseCase');

const dummyPayload = {
  username: 'johndoe',
  password: 'secret^_123',
};

describe('AddAuthenticationUseCase', () => {
  let mockUserRepo;
  let mockAuthRepo;
  let mockTokenManager;
  let mockPasswordHash;
  let addAuthenticationUseCase;

  beforeEach(() => {
    mockUserRepo = {
      getPasswordByUsername: jest.fn(),
      getIdByUsername: jest.fn(),
    };
    mockAuthRepo = {
      addToken: jest.fn(),
    };
    mockTokenManager = {
      createAccessToken: jest.fn(),
      createRefreshToken: jest.fn(),
    };
    mockPasswordHash = {
      comparePassword: jest.fn(),
    };

    addAuthenticationUseCase = new AddAuthenticationUseCase({
      userRepository: mockUserRepo,
      authenticationRepository: mockAuthRepo,
      authenticationTokenManager: mockTokenManager,
      passwordHash: mockPasswordHash,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      const useCase = new AddAuthenticationUseCase({});

      await expect(useCase.execute()).rejects.toThrow();
      await expect(useCase.execute([])).rejects.toThrow();
      await expect(useCase.execute({})).rejects.toThrow();
    });

    it('should propagate error when getPasswordByUsername fails', async () => {
      mockUserRepo.getPasswordByUsername.mockRejectedValue(new Error('get password fails'));

      await expect(addAuthenticationUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.comparePassword).not.toHaveBeenCalled();
      expect(mockUserRepo.getIdByUsername).not.toHaveBeenCalled();
      expect(mockAuthRepo.addToken).not.toHaveBeenCalled();
    });

    it('should propagate error when comparePassword fails', async () => {
      mockUserRepo.getPasswordByUsername.mockResolvedValue('encrypted_password');
      mockPasswordHash.comparePassword.mockRejectedValue(new Error('compare password fails'));

      await expect(addAuthenticationUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.comparePassword).toHaveBeenCalledTimes(1);
      expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith(dummyPayload.password, 'encrypted_password');
      expect(mockUserRepo.getIdByUsername).not.toHaveBeenCalled();
      expect(mockAuthRepo.addToken).not.toHaveBeenCalled();
    });

    it('should propagate error when getIdByUsername fails', async () => {
      mockUserRepo.getPasswordByUsername.mockResolvedValue('encrypted_password');
      mockPasswordHash.comparePassword.mockResolvedValue();
      mockUserRepo.getIdByUsername.mockRejectedValue(new Error('get user id fails'));

      await expect(addAuthenticationUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith(dummyPayload.password, 'encrypted_password');
      expect(mockUserRepo.getIdByUsername).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.getIdByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockAuthRepo.addToken).not.toHaveBeenCalled();
    });

    it('should propagate error when addToken fails', async () => {
      mockUserRepo.getPasswordByUsername.mockResolvedValue('encrypted_password');
      mockPasswordHash.comparePassword.mockResolvedValue();
      mockUserRepo.getIdByUsername.mockResolvedValue('user-123');
      mockTokenManager.createAccessToken.mockResolvedValue('access_token');
      mockTokenManager.createRefreshToken.mockResolvedValue('refresh_token');
      mockAuthRepo.addToken.mockRejectedValue(new Error('add token fails'));

      await expect(addAuthenticationUseCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith(dummyPayload.password, 'encrypted_password');
      expect(mockUserRepo.getIdByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledWith({
        username: dummyPayload.username, id: 'user-123'
      });
      expect(mockTokenManager.createRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.createRefreshToken).toHaveBeenCalledWith({
        username: dummyPayload.username, id: 'user-123'
      });
      expect(mockAuthRepo.addToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.addToken).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Successful executions', () => {
    it('should orchestrating the add authentication action correctly', async () => {
      mockUserRepo.getPasswordByUsername.mockResolvedValue('encrypted_password');
      mockPasswordHash.comparePassword.mockResolvedValue();
      mockTokenManager.createAccessToken.mockResolvedValue('access_token');
      mockTokenManager.createRefreshToken.mockResolvedValue('refresh_token');
      mockUserRepo.getIdByUsername.mockResolvedValue('user-123');
      mockAuthRepo.addToken.mockResolvedValue();

      const actualUserAuthentication = await addAuthenticationUseCase.execute({ ...dummyPayload });

      expect(actualUserAuthentication).toStrictEqual(new UserAuthentication({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      }));

      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledWith('johndoe');
      expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith('secret^_123', 'encrypted_password');
      expect(mockUserRepo.getIdByUsername).toHaveBeenCalledWith('johndoe');
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledWith({ username: 'johndoe', id: 'user-123' });
      expect(mockTokenManager.createRefreshToken).toHaveBeenCalledWith({ username: 'johndoe', id: 'user-123' });
      expect(mockAuthRepo.addToken).toHaveBeenCalledWith('refresh_token');
    });
  });
});