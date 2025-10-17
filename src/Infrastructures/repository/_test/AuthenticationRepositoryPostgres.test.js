const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');

describe('[Unit] AuthenticationRepositoryPostgres', () => {
  it('must be an instance of AuthenticationRepository', () => {
    const repo = new AuthenticationRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(AuthenticationRepository);
  });

  describe('Methods and Pool Query', () => {
    let mockPool;
    let authenticationRepo;

    beforeEach(() => {
      mockPool = {
        query: jest.fn(),
      };
      authenticationRepo = new AuthenticationRepositoryPostgres(mockPool, () => '');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('addToken', () => {
      it('should correctly persist the token', async () => {
        mockPool.query.mockResolvedValue();

        await expect(authenticationRepo.addToken('token'))
          .resolves.not.toThrow();

        expect(mockPool.query).toHaveBeenCalledTimes(1);
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.objectContaining({
            text: expect.stringContaining('INSERT INTO authentications'),
            values: ['token']
          })
        );
      });
    });
  });
});