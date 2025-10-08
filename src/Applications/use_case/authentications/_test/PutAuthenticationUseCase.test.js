const PutAuthenticationUseCase = require('../PutAuthenticationUseCase');

describe('PutAuthenticationUseCase', () => {
  describe('when executed with bad payload', () => {
    it('should throw error if payload not contain refresh token', async () => {
      const useCasePayload = { bad: 'not_contain_refresh_token' };
      const putAuthenticationUseCase = new PutAuthenticationUseCase({});

      await expect(putAuthenticationUseCase.execute(useCasePayload))
        .rejects.toThrow('PUT_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    });
  });
});