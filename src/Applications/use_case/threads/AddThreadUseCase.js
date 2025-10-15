const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({
    threadRepository,
  }) {
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    const newThread = new NewThread(payload);

    const addedThread = await this._threadRepository.addThread(newThread);
    if (addedThread instanceof AddedThread === false) {
      throw new Error('ADD_THREAD_USE_CASE.ADDED_THREAD_MUST_BE_INSTANCE_OF_ADDED_THREAD');
    }

    return addedThread;
  }
}

module.exports = AddThreadUseCase;