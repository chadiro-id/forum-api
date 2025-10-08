const AuthenticationRepository = require('../../../../Domains/authentications/AuthenticationRepository');
const DeleteAuthenticationUseCase = require('../DeleteAuthenticationUseCase');

describe('DeleteAuthenticationUseCase', () => {
  describe('when executed with bad payload', () => {
    it('should throw error if payload not contain refresh token', async () => {
      const useCasePayload = { bad: 'not_contain_refresh_token' };

      const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({});

      await expect(deleteAuthenticationUseCase.execute(useCasePayload))
        .rejects.toThrow('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    });

    it('should throw error if refresh token is not a string', async () => {
      const useCasePayload = { refreshToken: 123 };

      const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({});

      await expect(deleteAuthenticationUseCase.execute(useCasePayload))
        .rejects.toThrow('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error if refresh token is an empty string', async () => {
      const useCasePayload = { refreshToken: '' };

      const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({});

      await expect(deleteAuthenticationUseCase.execute(useCasePayload))
        .rejects.toThrow('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    });
  });

  describe('when executed with correct payload', () => {
    it('should orchestrating the delete authentication action correctly', async () => {
      const useCasePayload = { refreshToken: 'refresh_token' };

      const mockAuthenticationRepository = new AuthenticationRepository();
      mockAuthenticationRepository.checkAvailabilityToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationRepository.deleteToken = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const deleteAuthenticationUseCase = new DeleteAuthenticationUseCase({
        authenticationRepository: mockAuthenticationRepository,
      });

      await deleteAuthenticationUseCase.execute(useCasePayload);
      expect(mockAuthenticationRepository.checkAvailabilityToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationRepository.deleteToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
    });
  });
});