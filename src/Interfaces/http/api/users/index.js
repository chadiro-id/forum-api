const UsersHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'users',
  register: async (server, { container, validator }) => {
    const usersHandler = new UsersHandler(container, validator);
    server.route(routes(usersHandler));
  },
};
