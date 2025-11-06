const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const { assertQueryCalled } = require('../../../../tests/helper/assertionsHelper');

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
      it('should correctly resolve and not throw error', async () => {
        mockPool.query.mockResolvedValue();

        await expect(authenticationRepo.addToken('token'))
          .resolves.not.toThrow();

        assertQueryCalled(
          mockPool.query, 'INSERT INTO authentications', ['token']
        );
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(authenticationRepo.addToken('token'))
          .rejects.toThrow();
      });
    });

    describe('deleteToken', () => {
      it('should correctly resolve and not throw error', async () => {
        mockPool.query.mockResolvedValue();

        await expect(authenticationRepo.deleteToken('token'))
          .resolves.not.toThrow();

        assertQueryCalled(
          mockPool.query, 'DELETE FROM authentications WHERE token', ['token']
        );
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(authenticationRepo.deleteToken('token'))
          .rejects.toThrow();
      });
    });

    describe('isTokenExist', () => {
      it('should return true when token exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ token: 'refresh-token' }],
          rowCount: 1,
        });

        const result = await authenticationRepo.isTokenExist('refresh-token');
        expect(result).toBe(true);

        assertQueryCalled(
          mockPool.query, 'SELECT token FROM authentications', ['refresh-token']
        );
      });

      it('should return false when token not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const result = await authenticationRepo.isTokenExist('refresh-token');
        expect(result).toBe(false);

        assertQueryCalled(
          mockPool.query, 'SELECT token FROM authentications', ['refresh-token']
        );
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(authenticationRepo.isTokenExist('token'))
          .rejects.toThrow();
      });
    });
  });
});