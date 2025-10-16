const pool = require('../../database/postgres/pool');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const { usersTable } = require('../../../../tests/helper/postgres');

describe('UserRepositoryPostgres', () => {
  beforeEach(async () => {
    await usersTable.clean();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('#verifyAvailableUsername', () => {
    it('must throw InvariantError when username not available', async () => {
      await usersTable.add({
        username: 'forumapi',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      await expect(userRepositoryPostgres.verifyAvailableUsername('forumapi'))
        .rejects
        .toThrow(InvariantError);
    });

    it('should not throw InvariantError when username available', async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      await expect(userRepositoryPostgres.verifyAvailableUsername('forumapi'))
        .resolves
        .not.toThrow(InvariantError);
    });
  });

  describe('#addUser', () => {
    it('should persist register user entity and return registered user entity correctly', async () => {
      const registerUserEntity = new RegisterUser({
        username: 'forumapi',
        password: 'secret_password',
        fullname: 'Forum Api',
      });
      const fakeIdGenerator = () => '123';
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      await userRepositoryPostgres.addUser(registerUserEntity);

      const users = await usersTable.findById('user-123');
      expect(users).toHaveLength(1);
    });

    it('should return registered user entity correctly', async () => {
      const registerUser = new RegisterUser({
        username: 'forumapi',
        password: 'secret_password',
        fullname: 'Forum Api',
      });
      const fakeIdGenerator = () => '123';
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123',
        username: 'forumapi',
        fullname: 'Forum Api',
      }));
    });
  });

  describe('#getPasswordByUsername', () => {
    it('must throw InvariantError when the given username not exists', () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      return expect(userRepositoryPostgres.getPasswordByUsername('forumapi'))
        .rejects
        .toThrow(InvariantError);
    });

    it('must correctly return the password related to the given username when exists', async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      await usersTable.add({
        username: 'forumapi',
        password: 'secret_password',
      });

      const password = await userRepositoryPostgres.getPasswordByUsername('forumapi');
      expect(password).toBe('secret_password');
    });
  });

  describe('#getIdByUsername', () => {
    it('must throw InvariantError when user not found', async () => {
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      await expect(userRepositoryPostgres.getIdByUsername('forumapi'))
        .rejects
        .toThrow(InvariantError);
    });

    it('should return user id correctly', async () => {
      await usersTable.add({ id: 'user-321', username: 'forumapi' });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      const userId = await userRepositoryPostgres.getIdByUsername('forumapi');

      expect(userId).toEqual('user-321');
    });
  });
});
