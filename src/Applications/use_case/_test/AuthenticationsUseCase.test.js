const AuthenticationsUseCase = require('../AuthenticationsUseCase');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const PasswordHash = require('../../security/PasswordHash');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const NewAuthEntity = require('../../../Domains/authentications/entities/NewAuthEntity');

describe('AuthenticationsUseCase', () => {
  describe('authenticateUser method', () => {
    it('should orchestrating the authentications correctly', async () => {
      // Arrange
      const useCasePayload = {
        username: 'forumapi',
        password: 'secret',
      };
      const mockedAuthentication = new NewAuthEntity({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
      const mockUserRepository = new UserRepository();
      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();
      const mockPasswordHash = new PasswordHash();

      // Mocking
      mockUserRepository.getPasswordByUsername = jest.fn()
        .mockImplementation(() => Promise.resolve('encrypted_password'));
      mockPasswordHash.comparePassword = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.createAccessToken = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedAuthentication.accessToken));
      mockAuthenticationTokenManager.createRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve(mockedAuthentication.refreshToken));
      mockUserRepository.getIdByUsername = jest.fn()
        .mockImplementation(() => Promise.resolve('user-123'));
      mockAuthenticationRepository.addToken = jest.fn()
        .mockImplementation(() => Promise.resolve());

      // create use case instance
      const useCase = new AuthenticationsUseCase({
        userRepository: mockUserRepository,
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: mockAuthenticationTokenManager,
        passwordHash: mockPasswordHash,
      });

      // Action
      const actualAuthentication = await useCase.authenticateUser(useCasePayload);

      // Assert
      expect(actualAuthentication).toEqual(new NewAuthEntity({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      }));
      expect(mockUserRepository.getPasswordByUsername)
        .toHaveBeenCalledWith('forumapi');
      expect(mockPasswordHash.comparePassword)
        .toHaveBeenCalledWith('secret', 'encrypted_password');
      expect(mockUserRepository.getIdByUsername)
        .toHaveBeenCalledWith('forumapi');
      expect(mockAuthenticationTokenManager.createAccessToken)
        .toHaveBeenCalledWith({ username: 'forumapi', id: 'user-123' });
      expect(mockAuthenticationTokenManager.createRefreshToken)
        .toHaveBeenCalledWith({ username: 'forumapi', id: 'user-123' });
      expect(mockAuthenticationRepository.addToken)
        .toHaveBeenCalledWith(mockedAuthentication.refreshToken);
    });
  });

  describe('refreshAuthentication method', () => {
    it('should throw error if payload not contain refresh token', async () => {
      // Arrange
      const payload = {};
      const useCase = new AuthenticationsUseCase({});

      // Action & Assert
      await expect(useCase.refreshAuthentication(payload))
        .rejects
        .toThrow('AUTHENTICATIONS_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    });
  });
});