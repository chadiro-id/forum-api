const Comment = require('../../comments/entities/Comment');

class DetailThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this._id = payload.id;
    this._title = payload.title;
    this._body = payload.body;
    this._date = payload.date;
    this._username = payload.username;
    this._comments = [];
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
      || typeof username !== 'string'
      || ['string', 'object'].includes(typeof date) === false
    ) {
      throw new Error('DETAIL_THREAD.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    if (title.length > 255) {
      throw new Error('DETAIL_THREAD.TITLE_EXCEDD_CHAR_LIMIT');
    }

    if (Number.isNaN(Date.parse(date))) {
      throw new Error('DETAIL_THREAD.DATE_INVALID');
    }
  }

  get id() {
    return this._id;
  }

  get username() {
    return this._username;
  }

  get title() {
    return this._title;
  }

  get body() {
    return this._body;
  }

  get date() {
    return this._date;
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

module.exports = DetailThread;