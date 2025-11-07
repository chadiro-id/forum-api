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
    it('should correctly persist the RegisterUser and return RegisteredUser', async () => {
      const registerUser = new RegisterUser({
        username: 'johndoe',
        password: 'secret_password',
        fullname: 'John Doe',
      });

      const registeredUser = await userRepo.addUser(registerUser);

      const users = await pgTest.users.findById('user-123');
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual(expect.objectContaining({
        id: 'user-123',
        username: registerUser.username,
        password: registerUser.password,
        fullname: registerUser.fullname,
      }));

      expect(registeredUser).toBeInstanceOf(RegisteredUser);
      expect(registeredUser).toEqual(expect.objectContaining({
        id: 'user-123',
        username: registerUser.username,
        fullname: registerUser.fullname,
      }));
    });

    it('should propagate error when id is exists', async () => {
      await pgTest.users.add({ id: 'user-123', username: 'whoami' });
      const registerUser = new RegisterUser({
        username: 'johndoe',
        password: 'secret_password',
        fullname: 'John Doe',
      });

      const promise = userRepo.addUser(registerUser);
      await assertDBError(promise);
    });

    it('should propagate error when username is exists', async () => {
      await pgTest.users.add({ id: 'user-999', username: 'johndoe' });
      const registerUser = new RegisterUser({
        username: 'johndoe',
        password: 'secret_password',
        fullname: 'John Doe',
      });

      const promise = userRepo.addUser(registerUser);
      await assertDBError(promise);
    });
  });

  describe('getIdByUsername', () => {
    it('should return the id when username exist', async () => {
      await pgTest.users.add({ id: 'user-321', username: 'johndoe' });

      const userId = await userRepo.getIdByUsername('johndoe');
      expect(userId).toEqual('user-321');
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