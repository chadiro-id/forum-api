const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const UserRepository = require('../../../Domains/users/UserRepository');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
const { assertQueryCalled } = require('../../../../tests/helper/assertionsHelper');

describe('[Mock-Base Integration] UserRepositoryPostgres', () => {
  it('must be an instance of UserRepository', () => {
    const repo = new UserRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(UserRepository);
  });

  describe('Postgres Interaction', () => {
    let mockPool;
    let userRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      userRepo = new UserRepositoryPostgres(mockPool, () => '123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addUser', () => {
      it('should correctly persist the RegisterUser and return RegisteredUser', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'user-123', username: 'johndoe', fullname: 'John Doe' }],
          rowCount: 1,
        });

        const registeredUser = await userRepo.addUser(new RegisterUser({
          username: 'johndoe',
          password: 'supersecret',
          fullname: 'John Doe',
        }));

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('INSERT INTO users')
          })
        );
        const calledValues = mockPool.query.mock.calls[0][0].values;
        expect(calledValues[0]).toEqual('user-123');
        expect(calledValues[1]).toEqual('johndoe');
        expect(calledValues[2]).toEqual('supersecret');
        expect(calledValues[3]).toEqual('John Doe');

        expect(registeredUser).toBeInstanceOf(RegisteredUser);
        expect(registeredUser).toEqual(expect.objectContaining({
          id: 'user-123',
          username: 'johndoe',
          fullname: 'John Doe',
        }));
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(userRepo.addUser({}))
          .rejects.toThrow();
      });
    });

    describe('getIdByUsername', () => {
      it('should correctly pool.query and return the id', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'user-123' }],
          rowCount: 1,
        });

        const id = await userRepo.getIdByUsername('johndoe');

        assertQueryCalled(mockPool.query, 'SELECT id FROM users', ['johndoe']);

        expect(id).toEqual('user-123');
      });

      it('should throw InvariantError when username not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(userRepo.getIdByUsername('johndoe'))
          .rejects.toThrow(InvariantError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(userRepo.getIdByUsername({}))
          .rejects.toThrow();
      });
    });

    describe('getPasswordByUsername', () => {
      it('should correctly pool.query and return the password', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ password: 'supersecret' }],
          rowCount: 1,
        });

        const password = await userRepo.getPasswordByUsername('johndoe');

        assertQueryCalled(mockPool.query, 'SELECT password FROM users', ['johndoe']);

        expect(password).toEqual('supersecret');
      });

      it('should throw InvariantError when username not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(userRepo.getPasswordByUsername('nonexistent-username'))
          .rejects.toThrow(InvariantError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(userRepo.getPasswordByUsername({}))
          .rejects.toThrow();
      });
    });

    describe('verifyAvailableUsername', () => {
      it('should resolves when username available', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(userRepo.verifyAvailableUsername('johndoe'))
          .resolves.not.toThrow(InvariantError);

        assertQueryCalled(mockPool.query, 'SELECT username FROM users', ['johndoe']);
      });

      it('should throw InvariantError when username not available', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ username: 'johndoe' }],
          rowCount: 1,
        });

        await expect(userRepo.verifyAvailableUsername('johndoe'))
          .rejects.toThrow(InvariantError);
      });

      it('should propagate error when database fails', async () => {
        mockPool.query.mockRejectedValue(new Error('Database fails'));

        await expect(userRepo.verifyAvailableUsername({}))
          .rejects.toThrow();
      });
    });
  });
});