class DetailThreadEntity {
  constructor(payload) {
    this._verifyPayload(payload);
  }

  _verifyPayload(payload) {
    const {
      id, title, body, date, username, comments
    } = payload;

    if (!id || !title || !body || !date || !username || !comments) {
      throw new Error('DETAIL_THREAD_ENTITY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = DetailThreadEntity;