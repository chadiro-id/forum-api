const Reply = require('../../replies/entities/Reply');

class Comment {
  /**
   * Comment Entity constructor
   * @param {Object} payload
   * @property {string} id
   * @property {string} username
   * @property {string} content
   * @property {Date} date
   * @property {boolean} isDelete
   */
  constructor(payload) {
    this._validatePayload(payload);

    this._id = payload.id;
    this._username = payload.username;
    this._content = payload.content;
    this._isDelete = payload.isDelete;
    this._date = payload.date;
    this._replies = [];
    this._likeCount = 0;
  }

  _validatePayload(payload) {
    const { id, username, content, date, isDelete } = payload;

    if (!id || !username || !content || !date || isDelete === undefined) {
      throw new Error('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof isDelete !== 'boolean'
      || date instanceof Date === false
    ) {
      throw new Error('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (Number.isNaN(Date.parse(date))) {
      throw new Error('COMMENT.DATE_INVALID');
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

  set likeCount(value) {
    console.log('like count:', value, typeof value);
    if (typeof value !== 'number') {
      value = parseInt(value);
    }
    this._likeCount = value;
  }

  get likeCount() {
    return this._likeCount;
  }

  toJSON() {
    return {
      id: this.id,
      content: this.content,
      username: this.username,
      date: this.date.toISOString(),
      replies: this.replies,
      likeCount: this.likeCount,
    };
  }
}

module.exports = Comment;