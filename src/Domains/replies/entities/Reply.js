class Reply {
  /**
   * Reply Entity constructor
   * @param {Object} payload
   * @property {string} id
   * @property {string} commentId
   * @property {string} username
   * @property {string} content
   * @property {Date} date
   * @property {boolean} isDelete
   */
  constructor(payload) {
    this._validatePayload(payload);

    this._id = payload.id;
    this._commentId = payload.commentId;
    this._username = payload.username;
    this._content = payload.content;
    this._date = payload.date;
    this._isDelete = payload.isDelete;
  }

  _validatePayload(payload) {
    const { id, commentId, username, content, date, isDelete } = payload;

    if (!id || !commentId || !username || !content || !date || isDelete === undefined) {
      throw new Error('REPLY.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof commentId !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof isDelete !== 'boolean'
      || date instanceof Date === false
    ) {
      throw new Error('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (Number.isNaN(Date.parse(date))) {
      throw new Error('REPLY.DATE_INVALID');
    }
  }

  get id() {
    return this._id;
  }

  get commentId() {
    return this._commentId;
  }

  get username() {
    return this._username;
  }

  get content() {
    return this._isDelete
      ? '**balasan telah dihapus**'
      : this._content;
  }

  get date() {
    return this._date;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      content: this.content,
      date: this.date.toISOString(),
    };
  }
}

module.exports = Reply;