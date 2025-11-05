const AuthenticationPayload = require('../../../../Domains/authentications/entities/AuthenticationPayload');
const UserAuthentication = require('../../../../Domains/authentications/entities/UserAuthentication');
const AddAuthenticationUseCase = require('../AddAuthenticationUseCase');
const UserRepository = require('../../../../Domains/users/UserRepository');
const AuthenticationRepository = require('../../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../../security/AuthenticationTokenManager');
const PaswordHash = require('../../../security/PasswordHash');

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
    mockUserRepo = new UserRepository();
    mockUserRepo.getPasswordByUsername = jest.fn();
    mockUserRepo.getIdByUsername = jest.fn();

    mockAuthRepo = new AuthenticationRepository();
    mockAuthRepo.addToken = jest.fn();

    mockTokenManager = new AuthenticationTokenManager();
    mockTokenManager.createAccessToken = jest.fn();
    mockTokenManager.createRefreshToken = jest.fn();

    mockPasswordHash = new PaswordHash();
    mockPasswordHash.comparePassword = jest.fn();

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
      await expect(addAuthenticationUseCase.execute()).rejects.toThrow();
      await expect(addAuthenticationUseCase.execute([])).rejects.toThrow();
      await expect(addAuthenticationUseCase.execute({})).rejects.toThrow();
    });

    it('should propagate error when getPasswordByUsername fails', async () => {
      mockUserRepo.getPasswordByUsername.mockRejectedValue(new Error('get password fails'));

      await expect(addAuthenticationUseCase.execute({ ...dummyPayload })).rejects.toThrow();

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
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledWith(expect.any(AuthenticationPayload));
      expect(mockTokenManager.createRefreshToken).toHaveBeenCalledWith(expect.any(AuthenticationPayload));
      expect(mockAuthRepo.addToken).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add authentication action', async () => {
      mockUserRepo.getPasswordByUsername.mockResolvedValue('encrypted_password');
      mockPasswordHash.comparePassword.mockResolvedValue();
      mockTokenManager.createAccessToken.mockResolvedValue('access_token');
      mockTokenManager.createRefreshToken.mockResolvedValue('refresh_token');
      mockUserRepo.getIdByUsername.mockResolvedValue('user-123');
      mockAuthRepo.addToken.mockResolvedValue();

      const actualUserAuthentication = await addAuthenticationUseCase.execute({ ...dummyPayload });

      expect(actualUserAuthentication).toBeInstanceOf(UserAuthentication);
      expect(actualUserAuthentication).toEqual(
        expect.objectContaining({
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        })
      );

      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith(dummyPayload.password, 'encrypted_password');
      expect(mockUserRepo.getIdByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledWith(expect.any(AuthenticationPayload));
      expect(mockTokenManager.createRefreshToken).toHaveBeenCalledWith(expect.any(AuthenticationPayload));
      expect(mockAuthRepo.addToken).toHaveBeenCalledWith('refresh_token');
    });
  });
});