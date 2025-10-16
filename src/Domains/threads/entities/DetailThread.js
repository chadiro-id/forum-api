const Comment = require('../../comments/entities/Comment');

class DetailThread {
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

    console.log('typeof id', typeof id);
    console.log('typeof title', typeof title);
    console.log('typeof body', typeof body);
    console.log('typeof date', typeof date);
    console.log('typeof username', typeof username);

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

    if (typeof date === 'string') {
      const ms = Date.parse(date);
      if (Number.isNaN(ms)) {
        throw new Error('DETAIL_THREAD.INVALID_DATE_STRING');
      }
    } else {
      if (date instanceof Date === false) {
        throw new Error('DETAIL_THREAD.INVALID_DATE_OBJECT');
      }
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
      comments: this.comments.map((entry) => entry.toJSON()),
    };
  }
}

module.exports = DetailThread;