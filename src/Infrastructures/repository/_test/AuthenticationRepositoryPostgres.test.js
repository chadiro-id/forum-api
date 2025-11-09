const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const { assertQueryCalled, assertDBError } = require('../../../../tests/helper/assertionsHelper');

describe('[Mock-Based Integration] AuthenticationRepositoryPostgres', () => {
  it('must be an instance of AuthenticationRepository', () => {
    const repo = new AuthenticationRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(AuthenticationRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let dbError;
    let authenticationRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      dbError = new Error('Database fails');
      authenticationRepo = new AuthenticationRepositoryPostgres(mockPool);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addToken', () => {
      it('should resolves and call pool.query correctly', async () => {
        const calledQuery = {
          text: 'INSERT INTO authentications VALUES ($1)',
          values: ['token'],
        };

        mockPool.query.mockResolvedValue();

        await expect(authenticationRepo.addToken('token'))
          .resolves.not.toThrow();

        assertQueryCalled(mockPool.query, calledQuery);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = authenticationRepo.addToken('token');
        await assertDBError(promise);
      });
    });

    describe('deleteToken', () => {
      it('should resolves and call pool.query correctly', async () => {
        const calledQuery = {
          text: 'DELETE FROM authentications WHERE token = $1',
          values: ['token'],
        };

        mockPool.query.mockResolvedValue();

        await expect(authenticationRepo.deleteToken('token'))
          .resolves.not.toThrow();

        assertQueryCalled(mockPool.query, calledQuery);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = authenticationRepo.deleteToken('token');
        await assertDBError(promise);
      });
    });

    describe('isTokenExist', () => {
      it('should return true when token exist', async () => {
        const calledQuery = {
          text: 'SELECT token FROM authentications WHERE token = $1',
          values: ['refresh-token'],
        };

        mockPool.query.mockResolvedValue({
          rows: [{ token: 'refresh-token' }],
          rowCount: 1,
        });

        const result = await authenticationRepo.isTokenExist('refresh-token');
        expect(result).toBe(true);

        assertQueryCalled(mockPool.query, calledQuery);
      });

      it('should return false when token not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const result = await authenticationRepo.isTokenExist('refresh-token');
        expect(result).toBe(false);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = authenticationRepo.isTokenExist('token');
        await assertDBError(promise);
      });
    });
  });
});