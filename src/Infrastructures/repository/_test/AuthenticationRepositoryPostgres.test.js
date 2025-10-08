const pool = require('../../database/postgres/pool');
const AuthenticationsTestHelper = require('../../../../tests/AuthenticationsTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');

describe('AuthenticationRepositoryPostgres', () => {
  afterEach(async () => {
    await AuthenticationsTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('#addToken', () => {
    it('must correctly insert the given token into database', async () => {
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      await authenticationRepository.addToken(token);

      const tokens = await AuthenticationsTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe('#checkAvailabilityToken', () => {
    it('must throw InvariantError when the given token not exists', async () => {
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      await expect(authenticationRepository.checkAvailabilityToken(token))
        .rejects.toThrow(InvariantError);
    });

    it('should not throw error when the given token exists', async () => {
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';
      await AuthenticationsTestHelper.addToken(token);

      await expect(authenticationRepository.checkAvailabilityToken(token))
        .resolves.not.toThrow();
    });
  });

  describe('#deleteToken', () => {
    it('must correctly delete the given token from database', async () => {
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';
      await AuthenticationsTestHelper.addToken(token);

      await authenticationRepository.deleteToken(token);

      const tokens = await AuthenticationsTestHelper.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});