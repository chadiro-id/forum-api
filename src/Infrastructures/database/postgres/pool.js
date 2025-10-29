/* istanbul ignore file */
const { Pool } = require('pg');

let pool;
if (process.env.NODE_ENV === 'test') {
  pool = new Pool({
    host: process.env.PGHOST_TEST || process.env.PGHOST,
    database: process.env.PGDATABASE_TEST || process.env.PGDATABASE,
    user: process.env.PGUSER_TEST || process.env.PGUSER,
    password: process.env.PGPASSWORD_TEST || process.env.PGPASSWORD,
    port: process.env.PGPORT_TEST || process.env.PGPORT,
  });
} else {
  pool = new Pool();
}

module.exports = pool;
