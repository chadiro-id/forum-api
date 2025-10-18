const UserAuthentication = require('../../../../Domains/authentications/entities/UserAuthentication');
const AddAuthenticationUseCase = require('../AddAuthenticationUseCase');

describe('AddAuthenticationUseCase', () => {
  const dummyPayload = {
    username: 'johndoe',
    password: 'secret^_123',
  };

  let mockUserRepo;
  let mockAuthRepo;
  let mockTokenManager;
  let mockPasswordHash;

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

      const useCase = new AddAuthenticationUseCase({
        userRepository: mockUserRepo,
        authenticationRepository: mockAuthRepo,
        authenticationTokenManager: mockTokenManager,
        passwordHash: mockPasswordHash,
      });

      await expect(useCase.execute({ ...dummyPayload })).rejects.toThrow();

      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.comparePassword).not.toHaveBeenCalled();
      expect(mockUserRepo.getIdByUsername).not.toHaveBeenCalled();
      expect(mockAuthRepo.addToken).not.toHaveBeenCalled();
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

      const useCase = new AddAuthenticationUseCase({
        userRepository: mockUserRepo,
        authenticationRepository: mockAuthRepo,
        authenticationTokenManager: mockTokenManager,
        passwordHash: mockPasswordHash,
      });

      const actualUserAuthentication = await useCase.execute({ ...dummyPayload });

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