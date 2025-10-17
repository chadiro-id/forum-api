const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');

describe('[Unit] AuthenticationRepositoryPostgres', () => {
  it('must be an instance of AuthenticationRepository', () => {
    const repo = new AuthenticationRepositoryPostgres({}, () => '');
    expect(repo).toBeInstanceOf(AuthenticationRepository);
  });
});