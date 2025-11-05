const InvariantError = require('./InvariantError');

const usersUseCaseError = {
  'ADD_USER_USE_CASE.USERNAME_NOT_AVAILABLE': new InvariantError('username tidak tersedia'),
};
const authenticationsUseCaseError = {};
const threadsUseCaseError = {};
const commentsUseCaseError = {};
const repliesUseCaseError = {};

const directories = Object.assign(
  {},
  usersUseCaseError,
  authenticationsUseCaseError,
  threadsUseCaseError,
  commentsUseCaseError,
  repliesUseCaseError
);

class DomainErrorTranslator {
  static translate(error) {
    return directories[error.message] || error;
  }
}

module.exports = DomainErrorTranslator;