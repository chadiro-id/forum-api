const UserRepository = require('../../../Domains/users/UserRepository');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('[Unit] UserRepositoryPostgres', () => {
  it('should be an instance of UserRepository', () => {
    const repo = new UserRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(UserRepository);
  });
});