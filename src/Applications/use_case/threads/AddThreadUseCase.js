const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({
    threadRepository,
  }) {
    this._threadRepository = threadRepository;
  }

  async execute(payload) {
    if (payload instanceof NewThread === false) {
      throw new Error('ADD_THREAD_USE_CASE.PAYLOAD_MUST_BE_INSTANCE_OF_NEWTHREAD');
    }

    const threadRecord = {
      title: payload.title,
      body: payload.body,
      owner_id: payload.owner,
    };

    const addedThreadId = await this._threadRepository.addThread(threadRecord);

    return new AddedThread({
      id: addedThreadId,
      title: payload.title,
      owner: payload.owner,
    });
  }
}

module.exports = AddThreadUseCase;