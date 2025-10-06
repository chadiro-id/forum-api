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


  describe('addToken function', () => {
    it('should add token to database', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      // Action
      await authenticationRepository.addToken(token);

      // Assert
      const tokens = await AuthenticationsTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });
});