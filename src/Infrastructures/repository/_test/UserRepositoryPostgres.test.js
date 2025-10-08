const pool = require('../../database/postgres/pool');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisterUserEntity = require('../../../Domains/users/entities/RegisterUserEntity');
const RegisteredUserEntity = require('../../../Domains/users/entities/RegisteredUserEntity');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const UsersTestHelper = require('../../../../tests/UsersTestHelper');

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('#verifyAvailableUsername', () => {
    it('must throw InvariantError when username not available', async () => {
      await UsersTestHelper.addUser({
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
      const registerUserEntity = new RegisterUserEntity({
        username: 'forumapi',
        password: 'secret_password',
        fullname: 'Forum Api',
      });
      const fakeIdGenerator = () => '123';
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      await userRepositoryPostgres.addUser(registerUserEntity);

      const users = await UsersTestHelper.findUsersById('user-123');
      expect(users).toHaveLength(1);
    });

    it('should return registered user entity correctly', async () => {
      const registerUser = new RegisterUserEntity({
        username: 'forumapi',
        password: 'secret_password',
        fullname: 'Forum Api',
      });
      const fakeIdGenerator = () => '123';
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      expect(registeredUser).toStrictEqual(new RegisteredUserEntity({
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
      await UsersTestHelper.addUser({
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
      await UsersTestHelper.addUser({ id: 'user-321', username: 'forumapi' });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      const userId = await userRepositoryPostgres.getIdByUsername('forumapi');

      expect(userId).toEqual('user-321');
    });
  });
});
