const DeleteAuthenticationUseCase = require('../DeleteAuthenticationUseCase');

describe('DeleteAuthenticationUseCase', () => {
  let mockAuthRepo;
  let deleteAuthenticationUseCase;

  beforeEach(() => {
    mockAuthRepo = {
      verifyTokenExists: jest.fn(),
      deleteToken: jest.fn(),
    };
    deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(deleteAuthenticationUseCase.execute()).rejects.toThrow();
      await expect(deleteAuthenticationUseCase.execute({}))
        .rejects
        .toThrow('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
      await expect(deleteAuthenticationUseCase.execute({ refreshToken: '' }))
        .rejects
        .toThrow('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
      await expect(deleteAuthenticationUseCase.execute({ refreshToken: 123 }))
        .rejects
        .toThrow('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should propagate error when verifyTokenExists fails', async () => {
      const refreshToken = 'refresh_token';
      mockAuthRepo.verifyTokenExists.mockRejectedValue(new Error('checking fails'));

      await expect(deleteAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow();

      expect(mockAuthRepo.verifyTokenExists).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthRepo.deleteToken).not.toHaveBeenCalled();
    });

    it('should propagate error when deleteToken fails', async () => {
      const refreshToken = 'refresh_token';

      mockAuthRepo.verifyTokenExists.mockResolvedValue();
      mockAuthRepo.deleteToken.mockRejectedValue(new Error('delete token fails'));

      await expect(deleteAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow();

      expect(mockAuthRepo.verifyTokenExists).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthRepo.deleteToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the delete authentication action', async () => {
      const refreshToken = 'refresh_token';

      mockAuthRepo.verifyTokenExists.mockResolvedValue();
      mockAuthRepo.deleteToken.mockResolvedValue();

      await expect(deleteAuthenticationUseCase.execute({ refreshToken }))
        .resolves.not.toThrow();

      expect(mockAuthRepo.verifyTokenExists).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.verifyTokenExists).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthRepo.deleteToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.deleteToken).toHaveBeenCalledWith(refreshToken);
    });
  });
});