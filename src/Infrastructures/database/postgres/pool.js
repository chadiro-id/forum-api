/* istanbul ignore file */
const { Pool } = require('pg');
const config = require('../../../Commons/config');

const pool = config.environment === 'test' ? new Pool(config.pgTest) : new Pool();

module.exports = pool;
