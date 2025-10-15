class Comment {
  constructor(payload) {
    this._validatePayload(payload);
  }

  _validatePayload(payload) {
    const { id, content, date, username } = payload;

    if (!id || !content || !date || !username) {
      throw new Error('COMMENT.PAYLOAD_NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
      || typeof username !== 'string'
    ) {
      throw new Error('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }

    const ms = Date.parse(date);
    if (Number.isNaN(ms)) {
      throw new Error('COMMENT.INVALID_DATE_STRING');
    }
  }
}

module.exports = Comment;