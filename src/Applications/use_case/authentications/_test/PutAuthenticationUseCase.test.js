const AuthenticationRepository = require('../../../../Domains/authentications/AuthenticationRepository');
const AuthenticationTokenManager = require('../../../security/AuthenticationTokenManager');
const PutAuthenticationUseCase = require('../PutAuthenticationUseCase');

describe('PutAuthenticationUseCase', () => {
  describe('when executed with bad payload', () => {
    it('should throw error if payload not contain refresh token', async () => {
      const useCasePayload = { bad: 'not_contain_refresh_token' };
      const putAuthenticationUseCase = new PutAuthenticationUseCase({});

      await expect(putAuthenticationUseCase.execute(useCasePayload))
        .rejects.toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    });

    it('should throw error if refresh token is not a string', async () => {
      const useCasePayload = {
        refreshToken: 123,
      };

      const putAuthenticationUseCase = new PutAuthenticationUseCase({});

      await expect(putAuthenticationUseCase.execute(useCasePayload))
        .rejects.toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should throw error if refresh token is an empty string', async () => {
      const useCasePayload = {
        refreshToken: '',
      };

      const putAuthenticationUseCase = new PutAuthenticationUseCase({});

      await expect(putAuthenticationUseCase.execute(useCasePayload))
        .rejects.toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    });
  });

  describe('when executed with correct payload', () => {
    it('should orchestrating the put authentication action correctly', async () => {
      const useCasePayload = {
        refreshToken: 'some_refresh_token',
      };

      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();

      mockAuthenticationTokenManager.verifyRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationRepository.checkAvailabilityToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.decodePayload = jest.fn()
        .mockImplementation(() => Promise.resolve({ username: 'forumapi', id: 'user-123' }));
      mockAuthenticationTokenManager.createAccessToken = jest.fn()
        .mockImplementation(() => Promise.resolve('some_new_access_token'));

      const putAuthenticationUseCase = new PutAuthenticationUseCase({
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: mockAuthenticationTokenManager,
      });

      const accessToken = await putAuthenticationUseCase.execute(useCasePayload);

      expect(mockAuthenticationTokenManager.verifyRefreshToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationRepository.checkAvailabilityToken)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationTokenManager.decodePayload)
        .toHaveBeenCalledWith(useCasePayload.refreshToken);
      expect(mockAuthenticationTokenManager.createAccessToken)
        .toHaveBeenCalledWith({ username: 'forumapi', id: 'user-123' });
      expect(accessToken).toEqual('some_new_access_token');
    });
  });
});