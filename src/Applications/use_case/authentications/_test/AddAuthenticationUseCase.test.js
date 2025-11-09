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
      await expect(addAuthenticationUseCase.execute({}))
        .rejects.toThrow('USER_LOGIN.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when id not valid', async () => {
      mockUserRepo.getIdByUsername.mockResolvedValue(null);
      mockUserRepo.getPasswordByUsername.mockResolvedValue('encrypted_password');

      await expect(addAuthenticationUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('ADD_AUTHENTICATION_USE_CASE.USER_NOT_EXIST');
    });

    it('should throw error when password not valid', async () => {
      mockUserRepo.getIdByUsername.mockResolvedValue('user-123');
      mockUserRepo.getPasswordByUsername.mockResolvedValue(null);

      await expect(addAuthenticationUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow('ADD_AUTHENTICATION_USE_CASE.USER_NOT_EXIST');
    });

    it('should throw error when password not match', async () => {
      mockUserRepo.getIdByUsername.mockResolvedValue('user-123');
      mockUserRepo.getPasswordByUsername.mockResolvedValue('encrypted_password');
      mockPasswordHash.comparePassword.mockResolvedValue(false);

      await expect(addAuthenticationUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });

    it('should propagate error when addToken fails', async () => {
      mockUserRepo.getIdByUsername.mockResolvedValue('user-123');
      mockUserRepo.getPasswordByUsername.mockResolvedValue('encrypted_password');
      mockPasswordHash.comparePassword.mockResolvedValue(true);
      mockTokenManager.createAccessToken.mockResolvedValue('access_token');
      mockTokenManager.createRefreshToken.mockResolvedValue('refresh_token');
      mockAuthRepo.addToken.mockRejectedValue(new Error('fails'));

      await expect(addAuthenticationUseCase.execute({ ...dummyPayload }))
        .rejects.toThrow();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the add authentication action', async () => {
      mockUserRepo.getIdByUsername.mockResolvedValue('user-123');
      mockUserRepo.getPasswordByUsername.mockResolvedValue('encrypted_password');
      mockPasswordHash.comparePassword.mockResolvedValue(true);
      mockTokenManager.createAccessToken.mockResolvedValue('access_token');
      mockTokenManager.createRefreshToken.mockResolvedValue('refresh_token');
      mockAuthRepo.addToken.mockResolvedValue();

      const actualUserAuthentication = await addAuthenticationUseCase.execute({ ...dummyPayload });

      expect(actualUserAuthentication).toStrictEqual(new UserAuthentication({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      }));

      expect(mockUserRepo.getIdByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockUserRepo.getPasswordByUsername).toHaveBeenCalledWith(dummyPayload.username);
      expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith(dummyPayload.password, 'encrypted_password');
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledWith(new AuthenticationPayload({
        id: 'user-123', username: dummyPayload.username
      }));
      expect(mockTokenManager.createRefreshToken).toHaveBeenCalledWith(new AuthenticationPayload({
        id: 'user-123', username: dummyPayload.username
      }));
      expect(mockAuthRepo.addToken).toHaveBeenCalledWith('refresh_token');
    });
  });
});