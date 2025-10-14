/* istanbul ignore file */
const config = {
  environment: process.env.NODE_ENV,
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
    debug: ['development'].includes(process.env.NODE_ENV) ? { request: ['error'] } : {},
  },
  pgTest: {
    host: process.env.PGHOST_TEST,
    port: process.env.PGPORT_TEST,
    user: process.env.PGUSER_TEST,
    password: process.env.PGPASSWORD_TEST,
    database: process.env.PGDATABASE_TEST,
  },
  tokenize: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    accessTokenAge: process.env.ACCESS_TOKEN_AGE,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
  }
};

module.exports = config;
