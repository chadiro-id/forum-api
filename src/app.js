require('dotenv').config();

const { createServer } = require('./Infrastructures/http/server');
const container = require('./Infrastructures/container');

(async () => {
  const server = await createServer(container);
  await server.start();
  console.log(`server start at ${server.info.uri}`);
})();