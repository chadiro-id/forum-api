const PutAuthenticationUseCase = require('../PutAuthenticationUseCase');

describe('PutAuthenticationUseCase', () => {
  let mockAuthRepo;
  let mockTokenManager;

  beforeEach(() => {
    mockAuthRepo = {
      checkAvailabilityToken: jest.fn(),
    };
    mockTokenManager = {
      verifyRefreshToken: jest.fn(),
      createAccessToken: jest.fn(),
      decodePayload: jest.fn(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      const useCase = new PutAuthenticationUseCase({});

      await expect(useCase.execute()).rejects.toThrow();
      await expect(useCase.execute({}))
        .rejects
        .toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
      await expect(useCase.execute({ refreshToken: '' }))
        .rejects
        .toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
      await expect(useCase.execute({ refreshToken: 123 }))
        .rejects
        .toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should propagate error when refresh token verifications fails', async () => {
      mockTokenManager.verifyRefreshToken.mockRejectedValue(new Error('verifications fails'));

      const useCase = new PutAuthenticationUseCase({
        authenticationRepository: mockAuthRepo,
        authenticationTokenManager: mockTokenManager,
      });

      await expect(useCase.execute({ refreshToken: 'refresh_token' })).rejects.toThrow();

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith('refresh_token');
      expect(mockAuthRepo.checkAvailabilityToken).not.toHaveBeenCalled();
      expect(mockTokenManager.decodePayload).not.toHaveBeenCalled();
      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });

    it('should propagate error when checkAvailabilityToken fails', async () => {
      mockTokenManager.verifyRefreshToken.mockResolvedValue();
      mockAuthRepo.checkAvailabilityToken.mockRejectedValue(new Error('checking fails'));

      const useCase = new PutAuthenticationUseCase({
        authenticationRepository: mockAuthRepo,
        authenticationTokenManager: mockTokenManager,
      });

      await expect(useCase.execute({ refreshToken: 'refresh_token' })).rejects.toThrow();

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith('refresh_token');
      expect(mockAuthRepo.checkAvailabilityToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.checkAvailabilityToken).toHaveBeenCalledWith('refresh_token');
      expect(mockTokenManager.decodePayload).not.toHaveBeenCalled();
      expect(mockTokenManager.createAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('Successful executions', () => {
    it('should orchestrating the put authentication action correctly', async () => {
      const payload = { refreshToken: 'some_refresh_token' };

      mockTokenManager.verifyRefreshToken.mockResolvedValue();
      mockAuthRepo.checkAvailabilityToken.mockResolvedValue();
      mockTokenManager.decodePayload.mockResolvedValue({ username: 'johndoe', id: 'user-123' });
      mockTokenManager.createAccessToken.mockResolvedValue('new_access_token');

      const useCase = new PutAuthenticationUseCase({
        authenticationRepository: mockAuthRepo,
        authenticationTokenManager: mockTokenManager,
      });

      const accessToken = await useCase.execute(payload);

      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.verifyRefreshToken).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockAuthRepo.checkAvailabilityToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.checkAvailabilityToken).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockTokenManager.decodePayload).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.decodePayload).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledTimes(1);
      expect(mockTokenManager.createAccessToken).toHaveBeenCalledWith({ username: 'johndoe', id: 'user-123' });

      expect(accessToken).toEqual('new_access_token');
    });
  });
});