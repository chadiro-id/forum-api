class AddedThread {
  /**
   * Added Thread Entity constructor
   * @param {Object} payload
   * @property {string} id
   * @property {string} title
   * @property {string} owner
   */
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const { id, title, owner } = payload;

    if (!id || !title || !owner) {
      throw new Error('ADDED_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof title !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('ADDED_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (title.length > 255) {
      throw new Error('ADDED_THREAD.TITLE_EXCEED_CHAR_LIMIT');
    }
  }
}

module.exports = AddedThread;