class AddedThreadEntity {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const { id, title, owner } = payload;

    if (!id || !title || !owner) {
      throw new Error('ADDED_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = AddedThreadEntity;