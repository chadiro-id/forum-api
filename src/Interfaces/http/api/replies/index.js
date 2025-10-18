const RepliesHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'replies',
  register: async (server, { container, validator }) => {
    const handler = new RepliesHandler(container, validator);
    server.route(routes(handler));
  }
};