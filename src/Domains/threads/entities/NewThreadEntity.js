class NewThreadEntity {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const { title, body } = payload;

    if (!title || !body) {
      throw new Error('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string') {
      throw new Error('NEW_THREAD_ENTITY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThreadEntity;