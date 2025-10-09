class NewThreadEntity {
  constructor(payload) {
    this._verifyPayload(payload);

    this.title = payload.title;
    this.body = payload.body;
    this.userId = payload.userId;
  }

  _verifyPayload(payload) {
    const { title, body, userId } = payload;

    if (!title || !body || !userId) {
      throw new Error('NEW_THREAD_ENTITY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof userId !== 'string') {
      throw new Error('NEW_THREAD_ENTITY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThreadEntity;