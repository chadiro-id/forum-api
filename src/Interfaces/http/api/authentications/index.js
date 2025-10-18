const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  register: async (server, { container, validator }) => {
    const handler = new AuthenticationsHandler(container, validator);
    server.route(routes(handler));
  }
};