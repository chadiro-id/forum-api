class AddedThread {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const { id, title, owner } = payload;

    if (!id || !title || !owner) {
      throw new Error('ADDED_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = AddedThread;