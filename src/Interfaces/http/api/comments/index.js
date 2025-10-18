const CommentsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'comments',
  register: async (server, { container, validator }) => {
    const handler = new CommentsHandler(container, validator);
    server.route(routes(handler));
  },
};