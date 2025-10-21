const DeleteAuthenticationUseCase = require('../DeleteAuthenticationUseCase');

describe('DeleteAuthenticationUseCase', () => {
  let mockAuthRepo;
  let deleteAuthenticationUseCase;

  beforeEach(() => {
    mockAuthRepo = {
      checkAvailabilityToken: jest.fn(),
      deleteToken: jest.fn(),
    };
    deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      const useCase = new DeleteAuthenticationUseCase({});

      await expect(useCase.execute()).rejects.toThrow();
      await expect(useCase.execute({}))
        .rejects
        .toThrow('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
      await expect(useCase.execute({ refreshToken: '' }))
        .rejects
        .toThrow('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
      await expect(useCase.execute({ refreshToken: 123 }))
        .rejects
        .toThrow('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should propagate error when checkAvalibilityToken fails', async () => {
      mockAuthRepo.checkAvailabilityToken.mockRejectedValue(new Error('checking fails'));

      await expect(deleteAuthenticationUseCase.execute({ refreshToken: 'refresh_token' }))
        .rejects.toThrow();

      expect(mockAuthRepo.checkAvailabilityToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.checkAvailabilityToken).toHaveBeenCalledWith('refresh_token');
      expect(mockAuthRepo.deleteToken).not.toHaveBeenCalled();
    });

    it('should propagate error when deleteToken fails', async () => {
      mockAuthRepo.checkAvailabilityToken.mockResolvedValue();
      mockAuthRepo.deleteToken.mockRejectedValue(new Error('delete token fails'));

      await expect(deleteAuthenticationUseCase.execute({ refreshToken: 'refresh_token' }))
        .rejects.toThrow();

      expect(mockAuthRepo.checkAvailabilityToken).toHaveBeenCalledWith('refresh_token');
      expect(mockAuthRepo.deleteToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.deleteToken).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Successful executions', () => {
    it('should orchestrating the delete authentication action correctly', async () => {
      const payload = { refreshToken: 'refresh_token' };

      mockAuthRepo.checkAvailabilityToken.mockResolvedValue();
      mockAuthRepo.deleteToken.mockResolvedValue();

      await expect(deleteAuthenticationUseCase.execute(payload)).resolves.not.toThrow();

      expect(mockAuthRepo.checkAvailabilityToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.checkAvailabilityToken).toHaveBeenCalledWith(payload.refreshToken);
      expect(mockAuthRepo.deleteToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.deleteToken).toHaveBeenCalledWith(payload.refreshToken);
    });
  });
});