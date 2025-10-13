const pool = require('../../database/postgres/pool');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const { authenticationsTable } = require('../../../../tests/database/postgres');

describe('AuthenticationRepositoryPostgres', () => {
  beforeEach(async () => {
    await authenticationsTable.clean();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('#addToken', () => {
    it('must correctly insert the given token into database', async () => {
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      await authenticationRepository.addToken(token);

      const tokens = await authenticationsTable.findToken(token);
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
      await authenticationsTable.addToken(token);

      await expect(authenticationRepository.checkAvailabilityToken(token))
        .resolves.not.toThrow();
    });
  });

  describe('#deleteToken', () => {
    it('must correctly delete the given token from database', async () => {
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';
      await authenticationsTable.addToken(token);

      await authenticationRepository.deleteToken(token);

      const tokens = await authenticationsTable.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});