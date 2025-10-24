const PutAuthenticationUseCase = require('../PutAuthenticationUseCase');

describe('PutAuthenticationUseCase', () => {
  let mockAuthRepo;
  let mockTokenManager;
  let putAuthenticationUseCase;

  beforeEach(() => {
    mockAuthRepo = {
      verifyTokenExists: jest.fn(),
    };
    mockTokenManager = {
      verifyRefreshToken: jest.fn(),
      createAccessToken: jest.fn(),
      decodePayload: jest.fn(),
    };
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
      expect(mockAuthRepo.verifyTokenExists).not.toHaveBeenCalled();
      expect(mockTokenManager.decodePayload).not.toHaveBeenCalled();
      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });

    it('should propagate error when verifyTokenExists fails', async () => {
      const refreshToken = 'refresh_token';

      mockTokenManager.verifyRefreshToken.mockResolvedValue();
      mockAuthRepo.verifyTokenExists.mockRejectedValue(new Error('checking fails'));

      await expect(putAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow();

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthRepo.verifyTokenExists).toHaveBeenCalledWith(refreshToken);
      expect(mockTokenManager.decodePayload).not.toHaveBeenCalled();
      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the put authentication action', async () => {
      const payload = { refreshToken: 'some_refresh_token' };

      mockTokenManager.verifyRefreshToken.mockResolvedValue();
      mockAuthRepo.verifyTokenExists.mockResolvedValue();
      mockTokenManager.decodePayload.mockResolvedValue({ username: 'johndoe', id: 'user-123' });
      mockTokenManager.createAccessToken.mockResolvedValue('new_access_token');

      const accessToken = await putAuthenticationUseCase.execute(payload);

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockAuthRepo.verifyTokenExists).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.verifyTokenExists).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockTokenManager.decodePayload).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.decodePayload).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledWith({ username: 'johndoe', id: 'user-123' });

      expect(accessToken).toEqual('new_access_token');
    });
  });
});