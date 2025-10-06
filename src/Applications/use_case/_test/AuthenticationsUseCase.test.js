const AuthenticationsUseCase = require('../AuthenticationsUseCase');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const PasswordHash = require('../../security/PasswordHash');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const NewAuthEntity = require('../../../Domains/authentications/entities/NewAuthEntity');

describe('AuthenticationsUseCase', () => {
  describe('authenticateUser method', () => {
    it('should orchestrating the user authentications correctly', async () => {
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

    it('should throw error if refresh token not a string', async () => {
      // Arrange
      const payload = {
        refreshToken: 1,
      };
      const useCase = new AuthenticationsUseCase({});

      // Action & Assert
      await expect(useCase.refreshAuthentication(payload))
        .rejects
        .toThrow('AUTHENTICATIONS_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the refresh authentication action correctly', async () => {
      // Arrange
      const useCasePayload = {
        refreshToken: 'some_refresh_token',
      };
      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();
      // Mocking
      mockAuthenticationRepository.checkAvailabilityToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.verifyRefreshToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationTokenManager.decodePayload = jest.fn()
        .mockImplementation(() => Promise.resolve({ username: 'forumapi', id: 'user-123' }));
      mockAuthenticationTokenManager.createAccessToken = jest.fn()
        .mockImplementation(() => Promise.resolve('some_new_access_token'));
      // Create the use case instace
      const useCase = new AuthenticationsUseCase({
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: mockAuthenticationTokenManager,
      });

      // Action
      const accessToken = await useCase.refreshAuthentication(useCasePayload);

      // Assert
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

  describe('deauthenticate method', () => {
    it('should throw error if payload not contain refresh token', async () => {
      // Arrange
      const payload = {};
      const useCase = new AuthenticationsUseCase({});

      // Action & Assert
      await expect(useCase.deauthenticate(payload))
        .rejects
        .toThrow('AUTHENTICATIONS_USE_CASE.PAYLOAD_NOT_CONTAIN_REFRESH_TOKEN');
    });

    it('should throw error if refresh token not string', async () => {
      // Arrange
      const payload = {
        refreshToken: 123,
      };
      const useCase = new AuthenticationsUseCase({});

      // Action & Assert
      await expect(useCase.deauthenticate(payload))
        .rejects
        .toThrow('AUTHENTICATIONS_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should orchestrating the deauthenticate action correctly', async () => {
      // Arrange
      const payload = {
        refreshToken: 'refreshToken',
      };
      const mockAuthenticationRepository = new AuthenticationRepository();
      mockAuthenticationRepository.checkAvailabilityToken = jest.fn()
        .mockImplementation(() => Promise.resolve());
      mockAuthenticationRepository.deleteToken = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const useCase = new AuthenticationsUseCase({
        authenticationRepository: mockAuthenticationRepository,
      });

      // Act
      await useCase.deauthenticate(payload);

      // Assert
      expect(mockAuthenticationRepository.checkAvailabilityToken)
        .toHaveBeenCalledWith(payload.refreshToken);
      expect(mockAuthenticationRepository.deleteToken)
        .toHaveBeenCalledWith(payload.refreshToken);
    });
  });
});