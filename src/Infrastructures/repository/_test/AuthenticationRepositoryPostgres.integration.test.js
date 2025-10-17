const pool = require('../../database/postgres/pool');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const { authenticationsTable } = require('../../../../tests/helper/postgres');

describe('[Integration] AuthenticationRepositoryPostgres', () => {
  let authenticationRepo;

  beforeAll(() => {
    authenticationRepo = new AuthenticationRepositoryPostgres(pool, () => '');
  });

  beforeEach(async () => {
    await authenticationsTable.clean();
  });

  afterAll(async () => {
    await authenticationsTable.clean();
    await pool.end();
  });

  describe('addToken', () => {
    it('should correctly persist the token into database', async () => {
      const token = 'token';

      await authenticationRepo.addToken(token);

      const tokens = await authenticationsTable.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe('checkAvailabilityToken', () => {
    it('should throw InvariantError when the token not exists', async () => {
      const token = 'token';

      await expect(authenticationRepo.checkAvailabilityToken(token))
        .rejects.toThrow(InvariantError);
    });

    it('should not throw error when the token exists', async () => {
      const token = 'token';
      await authenticationsTable.addToken(token);

      await expect(authenticationRepo.checkAvailabilityToken(token))
        .resolves.not.toThrow();
    });
  });

  describe('deleteToken', () => {
    it('should correctly delete the token from database', async () => {
      const token = 'token';
      await authenticationsTable.addToken(token);

      await authenticationRepo.deleteToken(token);

      const tokens = await authenticationsTable.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});