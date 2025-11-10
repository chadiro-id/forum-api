class UserPassword {
  /**
   * User Password constructor
   * @param {Object} payload
   * @property {string} password
   */
  constructor(payload) {
    this.password = payload.password;
  }
}

module.exports = UserPassword;