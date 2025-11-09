const DeleteAuthenticationUseCase = require('../DeleteAuthenticationUseCase');
const AuthenticationRepository = require('../../../../Domains/authentications/AuthenticationRepository');

describe('DeleteAuthenticationUseCase', () => {
  let mockAuthRepo;
  let deleteAuthenticationUseCase;

  beforeEach(() => {
    mockAuthRepo = new AuthenticationRepository();
    mockAuthRepo.isTokenExist = jest.fn();
    mockAuthRepo.deleteToken = jest.fn();

    deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({
      authenticationRepository: mockAuthRepo,
    });
  });

  afterEach(() => jest.clearAllMocks());

  describe('Failure cases', () => {
    it('should throw error when payload not provided correctly', async () => {
      await expect(deleteAuthenticationUseCase.execute())
        .rejects.toThrow();
      await expect(deleteAuthenticationUseCase.execute({}))
        .rejects.toThrow();
    });

    it('should propagate error when isTokenExist fails', async () => {
      const refreshToken = 'refresh_token';
      mockAuthRepo.isTokenExist.mockRejectedValue(new Error('fails'));

      await expect(deleteAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow();

      expect(mockAuthRepo.deleteToken).not.toHaveBeenCalled();
    });

    it('should throw error when refresh token not found', async () => {
      const refreshToken = 'refresh_token';
      mockAuthRepo.isTokenExist.mockResolvedValue(false);

      await expect(deleteAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow('DELETE_AUTHENTICATION_USE_CASE.REFRESH_TOKEN_NOT_FOUND');

      expect(mockAuthRepo.deleteToken).not.toHaveBeenCalled();
    });

    it('should propagate error when deleteToken fails', async () => {
      const refreshToken = 'refresh_token';

      mockAuthRepo.isTokenExist.mockResolvedValue(true);
      mockAuthRepo.deleteToken.mockRejectedValue(new Error('fails'));

      await expect(deleteAuthenticationUseCase.execute({ refreshToken }))
        .rejects.toThrow();
    });
  });

  describe('Successful executions', () => {
    it('should correctly orchestrating the delete authentication action', async () => {
      const refreshToken = 'refresh_token';

      mockAuthRepo.isTokenExist.mockResolvedValue(true);
      mockAuthRepo.deleteToken.mockResolvedValue();

      await expect(deleteAuthenticationUseCase.execute({ refreshToken }))
        .resolves.not.toThrow();

      expect(mockAuthRepo.isTokenExist).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.isTokenExist).toHaveBeenCalledWith(refreshToken);
      expect(mockAuthRepo.deleteToken).toHaveBeenCalledTimes(1);
      expect(mockAuthRepo.deleteToken).toHaveBeenCalledWith(refreshToken);
    });
  });
});