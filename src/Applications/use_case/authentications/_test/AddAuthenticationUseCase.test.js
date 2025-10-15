const AuthenticationRepository = require('../../../../Domains/authentications/AuthenticationRepository');
const UserAuthentication = require('../../../../Domains/authentications/entities/UserAuthentication');
const UserRepository = require('../../../../Domains/users/UserRepository');
const AuthenticationTokenManager = require('../../../security/AuthenticationTokenManager');
const PasswordHash = require('../../../security/PasswordHash');
const AddAuthenticationUseCase = require('../AddAuthenticationUseCase');

describe('AddAuthenticationUseCase', () => {
  describe('when executed', () => {
    it('should orchestrating the add authentication action correctly', async () => {
      const useCasePayload = {
        username: 'forumapi',
        password: 'secret^_123',
      };

      const mockedAuthentication = new UserAuthentication({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });

      const mockUserRepository = new UserRepository();
      const mockAuthenticationRepository = new AuthenticationRepository();
      const mockAuthenticationTokenManager = new AuthenticationTokenManager();
      const mockPasswordHash = new PasswordHash();

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

      const addAuthenticationUseCase = new AddAuthenticationUseCase({
        userRepository: mockUserRepository,
        authenticationRepository: mockAuthenticationRepository,
        authenticationTokenManager: mockAuthenticationTokenManager,
        passwordHash: mockPasswordHash,
      });

      const actualUserAuthentication = await addAuthenticationUseCase.execute(useCasePayload);

      expect(actualUserAuthentication).toStrictEqual(new UserAuthentication({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      }));

      expect(mockUserRepository.getPasswordByUsername)
        .toHaveBeenCalledWith('forumapi');
      expect(mockPasswordHash.comparePassword)
        .toHaveBeenCalledWith('secret^_123', 'encrypted_password');
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
});