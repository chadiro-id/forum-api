const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const UserRepository = require('../../../Domains/users/UserRepository');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('[Unit] UserRepositoryPostgres', () => {
  it('must be an instance of UserRepository', () => {
    const repo = new UserRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(UserRepository);
  });

  describe('Methods and Pool Query', () => {
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
      it('should persist the registerUser and return the registeredUser correctly', async () => {
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

        expect(registeredUser).toStrictEqual(new RegisteredUser({
          id: 'user-123',
          username: 'johndoe',
          fullname: 'John Doe',
        }));
      });
    });

    describe('verifyAvailableUsername', () => {
      it('should throw InvariantError when the username is not available', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ username: 'johndoe' }],
          rowCount: 1,
        });

        await expect(userRepo.verifyAvailableUsername('johndoe'))
          .rejects.toThrow(InvariantError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT username FROM users'),
            values: ['johndoe']
          })
        );
      });

      it('should not throw InvariantError when the username is available', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(userRepo.verifyAvailableUsername('johndoe'))
          .resolves.not.toThrow(InvariantError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT username FROM users'),
            values: ['johndoe']
          })
        );
      });
    });

    describe('getPasswordByUsername', () => {
      it('should throw InvariantError when username not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(userRepo.getPasswordByUsername('johndoe'))
          .rejects.toThrow(InvariantError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT password FROM users'),
            values: ['johndoe']
          })
        );
      });

      it('should correctly pool.query and return the password related to username', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ password: 'supersecret' }],
          rowCount: 1,
        });

        const password = await userRepo.getPasswordByUsername('johndoe');

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT password FROM users'),
            values: ['johndoe']
          })
        );
        expect(password).toEqual('supersecret');
      });
    });

    describe('getIdByUsername', () => {
      it('should throw InvariantError when username not exists', async () => {
        mockPool.query.mockResolvedValue({
          rows: [], rowCount: 0
        });

        await expect(userRepo.getIdByUsername('johndoe'))
          .rejects.toThrow(InvariantError);

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT id FROM users'),
            values: ['johndoe']
          })
        );
      });

      it('should correctly pool.query and return the id related to username', async () => {
        mockPool.query.mockResolvedValue({
          rows: [{ id: 'user-123' }],
          rowCount: 1,
        });

        const id = await userRepo.getIdByUsername('johndoe');

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('SELECT id FROM users'),
            values: ['johndoe']
          })
        );

        expect(id).toEqual('user-123');
      });
    });
  });
});