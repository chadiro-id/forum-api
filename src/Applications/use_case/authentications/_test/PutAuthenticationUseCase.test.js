const AuthenticationPayload = require('../../../../Domains/authentications/entities/AuthenticationPayload');
const PutAuthenticationUseCase = require('../PutAuthenticationUseCase');
const AuthenticationRepository = require('../../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../../security/AuthenticationTokenManager');

describe('PutAuthenticationUseCase', () => {
  let mockAuthRepo;
  let mockTokenManager;
  let putAuthenticationUseCase;

  beforeEach(() => {
    mockAuthRepo = new AuthenticationRepository();
    mockAuthRepo.isTokenExist = jest.fn();

    mockTokenManager = new AuthenticationTokenManager();
    mockTokenManager.verifyRefreshToken = jest.fn();
    mockTokenManager.createAccessToken = jest.fn();
    mockTokenManager.decodePayload = jest.fn();

    putAuthenticationUseCase = new PutAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
      authenticationTokenManager: mockTokenManager,
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(putAuthenticationUseCase.execute({}))
        .rejects
        .toThrow('AUTH_REFRESH_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when refresh token invalid', async () => {
      mockTokenManager.verifyRefreshToken.mockResolvedValue({ isValid: false });

      await expect(putAuthenticationUseCase.execute({ refreshToken: 'refresh_token' }))
        .rejects.toThrow('PUT_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_VALID');

      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });

    it('should propagate error when isTokenExist fails', async () => {
      const refreshToken = 'refresh_token';

      mockTokenManager.verifyRefreshToken.mockResolvedValue({ isValid: true });
      mockAuthRepo.isTokenExist.mockRejectedValue(new Error('fails'));

      await expect(putAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow();

      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });

    it('should throw error when refresh token not found', async () => {
      const refreshToken = 'refresh_token';

      mockTokenManager.verifyRefreshToken.mockResolvedValue({ isValid: true });
      mockAuthRepo.isTokenExist.mockResolvedValue(false);

      await expect(putAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow('PUT_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND');

      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });

    it('should propagate error when decoded payload not contain needed property', async () => {
      const refreshToken = 'refresh_token';

      mockTokenManager.verifyRefreshToken.mockResolvedValue({ isValid: true });
      mockAuthRepo.isTokenExist.mockResolvedValue(true);
      mockTokenManager.decodePayload.mockResolvedValue({ username: 'johndoe' });

      await expect(putAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow('AUTHENTICATION_PAYLOAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');

      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the put authentication action', async () => {
      const payload = { refreshToken: 'some_refresh_token' };

      mockTokenManager.verifyRefreshToken.mockResolvedValue({ isValid: true });
      mockAuthRepo.isTokenExist.mockResolvedValue(true);
      mockTokenManager.decodePayload.mockResolvedValue({ username: 'johndoe', id: 'user-123' });
      mockTokenManager.createAccessToken.mockResolvedValue('new_access_token');

      const accessToken = await putAuthenticationUseCase.execute(payload);

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockAuthRepo.isTokenExist).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.isTokenExist).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockTokenManager.decodePayload).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.decodePayload).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledWith(new AuthenticationPayload({
        id: 'user-123',
        username: 'johndoe',
      }));

      expect(accessToken).toEqual('new_access_token');
    });
  });
});