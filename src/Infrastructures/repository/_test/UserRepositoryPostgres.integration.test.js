const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const pgTest = require('../../../../tests/helper/postgres');
const { assertDBError } = require('../../../../tests/helper/assertionsHelper');

beforeAll(async () => {
  await pgTest.truncate();
});

afterAll(async () => {
  await pgTest.end();
});

describe('[Integration] UserRepositoryPostgres', () => {
  let userRepo;

  beforeAll(() => {
    userRepo = new UserRepositoryPostgres(pgTest.getPool(), () => '123');
  });

  afterEach(async () => {
    await pgTest.users.clean();
  });

  describe('addUser', () => {
    let registerUser;

    beforeAll(() => {
      registerUser = new RegisterUser({
        username: 'johndoe',
        password: 'secret_password',
        fullname: 'John Doe',
      });
    });

    it('should correctly persist the RegisterUser and return RegisteredUser', async () => {
      const expectedPersistedUser = {
        id: 'user-123',
        username: registerUser.username,
        password: registerUser.password,
        fullname: registerUser.fullname,
      };
      const expectedRegisteredUser = new RegisteredUser({
        id: 'user-123',
        username: registerUser.username,
        fullname: registerUser.fullname,
      });

      const registeredUser = await userRepo.addUser(registerUser);
      expect(registeredUser).toStrictEqual(expectedRegisteredUser);

      const users = await pgTest.users.findById('user-123');
      expect(users).toStrictEqual([expectedPersistedUser]);
    });

    it('should propagate error when id violate constraint', async () => {
      await pgTest.users.add({ id: 'user-123', username: 'whoami' });

      const promise = userRepo.addUser(registerUser);
      await assertDBError(promise);
    });

    it('should propagate error when username violate constraint', async () => {
      await pgTest.users.add({ id: 'user-999', username: 'johndoe' });

      const promise = userRepo.addUser(registerUser);
      await assertDBError(promise);
    });
  });

  describe('getIdByUsername', () => {
    it('should return the id when username exist', async () => {
      await pgTest.users.add({ id: 'user-321', username: 'johndoe' });

      const userId = await userRepo.getIdByUsername('johndoe');
      expect(userId).toStrictEqual('user-321');
    });

    it('should return null when username not exist', async () => {
      const userId = await userRepo.getIdByUsername('johndoe');
      expect(userId).toBeNull();
    });
  });

  describe('getPasswordByUsername', () => {
    it('should return the password when username exist', async () => {
      await pgTest.users.add({
        username: 'johndoe',
        password: 'secret_password',
      });

      const password = await userRepo.getPasswordByUsername('johndoe');
      expect(password).toBe('secret_password');
    });

    it('should return null when username not exist', async () => {
      const password = await userRepo.getPasswordByUsername('johndoe');
      expect(password).toBeNull();
    });
  });

  describe('isUsernameExist', () => {
    it('should return true when username exist', async () => {
      await pgTest.users.add({ username: 'johndoe' });

      const result = await userRepo.isUsernameExist('johndoe');
      expect(result).toBe(true);
    });

    it('should return false when username not exist', async () => {
      const result = await userRepo.isUsernameExist('johndoe');
      expect(result).toBe(false);
    });
  });
});