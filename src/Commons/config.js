/* istanbul ignore file */
const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
    debug: ['development'].includes(process.env.NODE_ENV) ? { request: ['error'] } : {},
  },
  tokenize: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
  }
};

module.exports = config;
