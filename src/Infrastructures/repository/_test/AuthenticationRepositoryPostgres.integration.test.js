const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const pgTest = require('../../../../tests/helper/postgres');

beforeAll(async () => {
  await pgTest.truncate();
});

afterAll(async () => {
  await pgTest.end();
});

describe('[Integration] AuthenticationRepositoryPostgres', () => {
  let authenticationRepo;

  beforeAll(() => {
    authenticationRepo = new AuthenticationRepositoryPostgres(pgTest.getPool());
  });

  afterEach(async () => {
    await pgTest.authentications.clean();
  });

  describe('addToken', () => {
    it('should correctly resolve and not throw error', async () => {
      const token = 'token';
      await authenticationRepo.addToken(token);

      const tokens = await pgTest.authentications.findToken(token);

      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe('deleteToken', () => {
    it('should correctly resolve and not throw error', async () => {
      const token = 'token';
      await pgTest.authentications.addToken(token);

      await expect(authenticationRepo.deleteToken(token))
        .resolves.not.toThrow();

      const tokens = await pgTest.authentications.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });

  describe('verifyTokenExists', () => {
    it('should correctly resolve and not throw error', async () => {
      const token = 'token';
      await pgTest.authentications.addToken(token);

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