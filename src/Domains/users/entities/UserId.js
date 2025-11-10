class UserId {
  /**
   * User Id constructor
   * @param {Object} payload
   * @property {string} id
   */
  constructor(payload) {
    this.id = payload.id;
  }
}

module.exports = UserId;