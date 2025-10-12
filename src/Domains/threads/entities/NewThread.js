class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const { title, body, owner } = payload;

    if (!title || !body || !owner) {
      throw new Error('NEW_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof title !== 'string'
      || typeof body !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('NEW_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThread;