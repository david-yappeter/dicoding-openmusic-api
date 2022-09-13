const routes = require('./routes');
const AuthenticationHandler = require('./handler');
const AuthenticationService = require('../../service/postgres/AuthenticationService');
const AuthenticationValidator = require('../../validation/authentication');
const UserService = require('../../service/postgres/UserService');
const TokenManager = require('../../tokenize/jwt');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server) => {
    const authenticationHandler = new AuthenticationHandler(
      new AuthenticationService(),
      new UserService(),
      TokenManager,
      AuthenticationValidator
    );
    server.route(routes(authenticationHandler));
  },
};
