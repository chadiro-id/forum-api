const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const { assertQueryCalled } = require('../../../../tests/utils/repository.test-util');

describe('[Mock-Based Integration] AuthenticationRepositoryPostgres', () => {
  it('must be an instance of AuthenticationRepository', () => {
    const repo = new AuthenticationRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(AuthenticationRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let authenticationRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      authenticationRepo = new AuthenticationRepositoryPostgres(mockPool, () => '');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addToken', () => {
      it('should correctly persist the token', async () => {
        mockPool.query.mockResolvedValue();

        await expect(authenticationRepo.addToken('token'))
          .resolves.not.toThrow();

        assertQueryCalled(
          mockPool.query, 'INSERT INTO authentications', ['token']
        );
      });
    });

    describe('checkAvailibilityToken', () => {
      it('should throw InvariantError when token not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(authenticationRepo.checkAvailabilityToken('token'))
          .rejects.toThrow(InvariantError);

        assertQueryCalled(
          mockPool.query, 'SELECT token FROM authentications', ['token']
        );
      });

      it('should resolves and not throw InvariantError when token exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ token: 'token' }],
          rowCount: 1,
        });

        await expect(authenticationRepo.checkAvailabilityToken('token'))
          .resolves.not.toThrow(InvariantError);

        assertQueryCalled(
          mockPool.query, 'SELECT token FROM authentications', ['token']
        );
      });
    });

    describe('deleteToken', () => {
      it('should resolve and call pool.query correctly', async () => {
        mockPool.query.mockResolvedValue();

        await expect(authenticationRepo.deleteToken('token'))
          .resolves.not.toThrow();

        assertQueryCalled(
          mockPool.query, 'DELETE FROM authentications WHERE token', ['token']
        );
      });
    });
  });
});