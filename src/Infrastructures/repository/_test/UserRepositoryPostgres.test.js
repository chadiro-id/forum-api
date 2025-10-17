const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const UserRepository = require('../../../Domains/users/UserRepository');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('[Unit] UserRepositoryPostgres', () => {
  it('should be an instance of UserRepository', () => {
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
  });
});