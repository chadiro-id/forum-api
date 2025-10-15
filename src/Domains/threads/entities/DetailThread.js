const Comment = require('../../comments/entities/Comment');

class DetailThreadEntity {
  _comments;

  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.body = payload.body;
    this.date = payload.date;
    this.username = payload.username;
    this.comments = payload.comments || [];
  }

  _verifyPayload(payload) {
    const {
      id, title, body, date, username,
    } = payload;

    if (!id || !title || !body || !date || !username) {
      throw new Error('DETAIL_THREAD.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof title !== 'string'
      || typeof body !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
    ) {
      throw new Error('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const ms = Date.parse(date);
    if (Number.isNaN(ms)) {
      throw new Error('DETAIL_THREAD.INVALID_DATE_STRING');
    }
  }

  set comments(value) {
    if (!value || !Array.isArray(value)) {
      throw new Error('DETAIL_THREAD.COMMENTS_MUST_BE_AN_ARRAY');
    }

    const hasInvalidElement = value.some((el) => el instanceof Comment === false);
    if (hasInvalidElement) {
      throw new Error('DETAIL_THREAD.COMMENTS_INVALID_ELEMENT');
    }
    this._comments = value;
  }

  get comments() {
    return this._comments;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      body: this.body,
      username: this.username,
      date: this.date,
      comments: this.comments,
    };
  }
}

module.exports = DetailThreadEntity;