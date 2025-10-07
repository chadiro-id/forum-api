class NewThreadEntity {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const { title, body } = payload;

    if (!title || !body) {
      throw new Error('NEW_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = NewThreadEntity;