const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor(jwt, accessTokenKey, refreshTokenKey) {
    super();

    this._jwt = jwt;
    this._accessTokenKey = accessTokenKey;
    this._refreshTokenKey = refreshTokenKey;
  }

  async createAccessToken(payload) {
    return this._jwt.generate(payload, this._accessTokenKey);
  }

  async createRefreshToken(payload) {
    return this._jwt.generate(payload, this._refreshTokenKey);
  }

  async verifyRefreshToken(token) {
    try {
      const artifacts = this._jwt.decode(token);
      this._jwt.verify(artifacts, this._refreshTokenKey);
    } catch (err) {
      console.error('[JwtTokenManager]', err);
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async decodePayload(token) {
    const artifacts = this._jwt.decode(token);
    return artifacts.decoded.payload;
  }
}

module.exports = JwtTokenManager;