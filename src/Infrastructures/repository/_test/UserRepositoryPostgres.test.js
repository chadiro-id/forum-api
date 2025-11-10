const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const UserRepository = require('../../../Domains/users/UserRepository');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const { assertQueryCalled, assertDBError } = require('../../../../tests/helper/assertionsHelper');

describe('[Mock-Based Integration] UserRepositoryPostgres', () => {
  it('must be an instance of UserRepository', () => {
    const repo = new UserRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(UserRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let dbError;
    let userRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      dbError = new Error('Database fails');
      userRepo = new UserRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addUser', () => {
      it('should resolves and call pool.query correctly', async () => {
        const expectedQueryText =
          'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id, username, fullname';
        const expectedQueryValues = ['user-123', 'johndoe', 'supersecret', 'John Doe'];

        mockPool.query.mockResolvedValue({
          rows: [{ id: 'user-123', username: 'johndoe', fullname: 'John Doe' }],
          rowCount: 1,
        });

        const registeredUser = await userRepo.addUser(new RegisterUser({
          username: 'johndoe',
          password: 'supersecret',
          fullname: 'John Doe',
        }));
        expect(registeredUser).toBeInstanceOf(RegisteredUser);

        assertQueryCalled(
          mockPool.query, expectedQueryText, expectedQueryValues
        );
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = userRepo.addUser({});
        await assertDBError(promise);
      });
    });

    describe('getIdByUsername', () => {
      it('should resolves and call pool.query correctly', async () => {
        const queryText = 'SELECT id FROM users WHERE username = $1';
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'user-123' }],
          rowCount: 1,
        });

        const id = await userRepo.getIdByUsername('johndoe');
        expect(id).toEqual('user-123');

        assertQueryCalled(mockPool.query, queryText, ['johndoe']);
      });

      it('should return null when username not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const id = await userRepo.getIdByUsername('johndoe');
        expect(id).toBeNull();
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = userRepo.getIdByUsername('username');
        await assertDBError(promise);
      });
    });

    describe('getPasswordByUsername', () => {
      it('should resolves and call pool.query correctly', async () => {
        const queryText = 'SELECT password FROM users WHERE username = $1';
        mockPool.query.mockResolvedValue({
          rows: [{ password: 'supersecret' }],
          rowCount: 1,
        });

        const password = await userRepo.getPasswordByUsername('johndoe');
        expect(password).toEqual('supersecret');

        assertQueryCalled(mockPool.query, queryText, ['johndoe']);
      });

      it('should return null when username not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        const password = await userRepo.getPasswordByUsername('johndoe');
        expect(password).toBeNull();
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = userRepo.getPasswordByUsername('username');
        await assertDBError(promise);
      });
    });

    describe('isUsernameExist', () => {
      it('should return true when username exist', async () => {
        const queryText = 'SELECT username FROM users WHERE username = $1';
        mockPool.query.mockResolvedValue({
          rows: [{ username: 'johndoe' }],
          rowCount: 1,
        });

        const result = await userRepo.isUsernameExist('johndoe');
        expect(result).toBe(true);

        assertQueryCalled(mockPool.query, queryText, ['johndoe']);
      });

      it('should return false when username not exist', async () => {
        mockPool.query.mockResolvedValue({
          rows: [],
          rowCount: 0,
        });

        const result = await userRepo.isUsernameExist('johndoe');
        expect(result).toBe(false);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(dbError);

        const promise = userRepo.isUsernameExist('username');
        await assertDBError(promise);
      });
    });
  });
});