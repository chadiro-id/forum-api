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
      await expect(putAuthenticationUseCase.execute()).rejects.toThrow();
      await expect(putAuthenticationUseCase.execute({}))
        .rejects
        .toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
      await expect(putAuthenticationUseCase.execute({ refreshToken: '' }))
        .rejects
        .toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
      await expect(putAuthenticationUseCase.execute({ refreshToken: 123 }))
        .rejects
        .toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should propagate error when verifyRefreshToken fails', async () => {
      mockTokenManager.verifyRefreshToken.mockRejectedValue(new Error('verifications fails'));

      await expect(putAuthenticationUseCase.execute({ refreshToken: 'refresh_token' }))
        .rejects.toThrow();

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith('refresh_token');
      expect(mockAuthRepo.isTokenExist).not.toHaveBeenCalled();
      expect(mockTokenManager.decodePayload).not.toHaveBeenCalled();
      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });

    it('should throw error when refresh token not found', async () => {
      const refreshToken = 'refresh_token';

      mockTokenManager.verifyRefreshToken.mockResolvedValue();
      mockAuthRepo.isTokenExist.mockResolvedValue(false);

      await expect(putAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow('PUT_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND');

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthRepo.isTokenExist).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenManager.decodePayload).not.toHaveBeenCalled();
      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });

    it('should propagate error when decoded payload not contain needed property', async () => {
      const refreshToken = 'refresh_token';

      mockTokenManager.verifyRefreshToken.mockResolvedValue();
      mockAuthRepo.isTokenExist.mockResolvedValue(true);
      mockTokenManager.decodePayload.mockResolvedValue({ username: 'johndoe' });

      await expect(putAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow();

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthRepo.isTokenExist).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenManager.decodePayload).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the put authentication action', async () => {
      const payload = { refreshToken: 'some_refresh_token' };

      mockTokenManager.verifyRefreshToken.mockResolvedValue();
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