const pool = require('../../database/postgres/pool');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const { usersTable } = require('../../../../tests/helper/postgres');

describe('[Integration] UserRepositoryPostgres', () => {
  let userRepo;

  beforeAll(() => {
    userRepo = new UserRepositoryPostgres(pool, () => '123');
  });

  beforeEach(async () => {
    await usersTable.clean();
  });

  afterAll(async () => {
    await usersTable.clean();
    await pool.end();
  });

  describe('addUser', () => {
    it('should correctly persist the RegisterUser and return RegisteredUser', async () => {
      const registerUser = new RegisterUser({
        username: 'johndoe',
        password: 'secret_password',
        fullname: 'John Doe',
      });
      const expectedRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: 'johndoe',
        fullname: 'John Doe',
      });

      const registeredUser = await userRepo.addUser(registerUser);

      const users = await usersTable.findById('user-123');
      expect(users).toHaveLength(1);

      expect(registeredUser).toStrictEqual(expectedRegisteredUser);
    });
  });

  describe('getIdByUsername', () => {
    it('should correctly resolve and return the id', async () => {
      await usersTable.add({ id: 'user-321', username: 'johndoe' });

      const userId = await userRepo.getIdByUsername('johndoe');

      expect(userId).toEqual('user-321');
    });

    it('should throw InvariantError when username not exists', async () => {
      await expect(userRepo.getIdByUsername('johndoe'))
        .rejects
        .toThrow(InvariantError);
    });
  });

  describe('getPasswordByUsername', () => {
    it('should correctly resolve and return the password', async () => {
      await usersTable.add({
        username: 'johndoe',
        password: 'secret_password',
      });

      const password = await userRepo.getPasswordByUsername('johndoe');
      expect(password).toBe('secret_password');
    });

    it('should throw InvariantError when username not exists', () => {
      return expect(userRepo.getPasswordByUsername('johndoe'))
        .rejects
        .toThrow(InvariantError);
    });
  });

  describe('verifyAvailableUsername', () => {
    it('should correctly resolve and not throw error', async () => {
      await expect(userRepo.verifyAvailableUsername('johndoe23'))
        .resolves
        .not.toThrow();
    });

    it('should throw InvariantError when username not available', async () => {
      await usersTable.add({ username: 'johndoe' });

      await expect(userRepo.verifyAvailableUsername('johndoe'))
        .rejects
        .toThrow(InvariantError);
    });
  });
});
