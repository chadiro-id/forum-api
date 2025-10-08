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
});