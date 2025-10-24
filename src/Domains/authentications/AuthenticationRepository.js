class AuthenticationRepository {
  async addToken(_token) {
    throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteToken(_token) {
    throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyTokenExists(_token) {
    throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = AuthenticationRepository;