const NewThreadEntity = require('../../../Domains/threads/entities/NewThreadEntity');

class AddThreadUseCase {
  constructor({
    userRepository,
    threadRepository,
  }) {
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
  }

  async execute(userId, payload) {
    await this._userRepository.verifyUserById(userId);

    const entity = new NewThreadEntity({ ...payload, userId });

    return this._threadRepository.addThread(entity);
  }
}

module.exports = AddThreadUseCase;