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
    it('should correctly persist token into database', async () => {
      const token = 'token';
      await authenticationRepo.addToken(token);

      const tokens = await authenticationsTable.findToken(token);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe('deleteToken', () => {
    it('should correctly delete token from database', async () => {
      const token = 'token';
      await authenticationsTable.addToken(token);

      await authenticationRepo.deleteToken(token);

      const tokens = await authenticationsTable.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });

  describe('verifyTokenExists', () => {
    it('should correctly resolve and not throw error', async () => {
      const token = 'token';
      await authenticationsTable.addToken(token);

      await expect(authenticationRepo.verifyTokenExists(token))
        .resolves.not.toThrow();
    });

    it('should throw InvariantError when token not exists', async () => {
      const token = 'token';

      await expect(authenticationRepo.verifyTokenExists(token))
        .rejects.toThrow(InvariantError);
    });
  });
});