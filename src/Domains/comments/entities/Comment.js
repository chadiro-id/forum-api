const Reply = require('../../replies/entities/Reply');

class Comment {
  constructor(payload) {
    this._validatePayload(payload);

    this._id = payload.id;
    this._username = payload.username;
    this._content = payload.content;
    this._isDelete = payload.isDelete;
    this._date = payload.date;
    this._replies = payload.replies || [];
  }

  _validatePayload(payload) {
    const { id, username, content, date, isDelete, replies } = payload;

    if (!id || !username || !content || !date || isDelete === undefined) {
      throw new Error('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof isDelete !== 'boolean'
      || ['string', 'object'].includes(typeof date) === false
    ) {
      throw new Error('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const ms = Date.parse(date);
    if (Number.isNaN(ms)) {
      throw new Error('COMMENT.INVALID_DATE_STRING');
    }

    if (Array.isArray(replies)) {
      const hasInvalidElement = replies.some((el) => el instanceof Reply === false);
      if (hasInvalidElement) {
        throw new Error('COMMENT.REPLIES_INVALID_ELEMENT');
      }
    }
  }

  get id() {
    return this._id;
  }

  get username() {
    return this._username;
  }

  get content() {
    return this._isDelete
      ? '**komentar telah dihapus**'
      : this._content;
  }

  get date() {
    return this._date;
  }

  set replies(value) {
    if (!value || !Array.isArray(value)) {
      throw new Error('COMMENT.REPLIES_MUST_BE_AN_ARRAY');
    }

    const hasInvalidElement = value.some((el) => el instanceof Reply === false);

    if (hasInvalidElement) {
      throw new Error('COMMENT.REPLIES_INVALID_ELEMENT');
    }

    this._replies = value;
  }

  get replies() {
    return this._replies;
  }

  toJSON() {
    return {
      id: this.id,
      content: this.content,
      username: this.username,
      date: this.date,
      replies: this.replies,
    };
  }
}

module.exports = Comment;