const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor(jwt) {
    super();

    this._jwt = jwt;
  }
}

module.exports = JwtTokenManager;