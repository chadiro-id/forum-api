const NewThreadEntity = require('../../Domains/threads/entities/NewThreadEntity');

class ThreadsUseCase {
  constructor({ userRepository, threadRepository }) {
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
  }

  async addThread(payload) {
    const entity = new NewThreadEntity(payload);

    await this._userRepository.verifyUserById(entity.owner);

    return this._threadRepository.addThread(entity);
  }
}

module.exports = ThreadsUseCase;