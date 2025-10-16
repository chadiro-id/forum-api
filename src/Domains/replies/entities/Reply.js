class Reply {
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
      || ['string', 'object'].includes(typeof date) === false
    ) {
      throw new Error('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const ms = Date.parse(date);
    if (Number.isNaN(ms)) {
      throw new Error('REPLY.INVALID_DATE_STRING');
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
      date: this.date,
    };
  }
}

module.exports = Reply;