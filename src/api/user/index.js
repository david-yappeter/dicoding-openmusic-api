const routes = require('./routes');
const UserHandler = require('./handler');
const UserService = require('../../service/postgres/UserService');
const UserValidator = require('../../validation/user');

module.exports = {
  name: 'user',
  version: '1.0.0',
  register: async (server) => {
    const userHandler = new UserHandler(new UserService(), UserValidator);
    server.route(routes(userHandler));
  },
};
