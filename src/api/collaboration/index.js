const routes = require('./routes');
const CollaborationHandler = require('./handler');
const CollaborationService = require('../../service/postgres/CollaborationService');
const CollaborationValidator = require('../../validation/collaboration');
const PlaylistService = require('../../service/postgres/PlaylistService');
const UserService = require('../../service/postgres/UserService');

module.exports = {
  name: 'collaboration',
  version: '1.0.0',
  register: async (server) => {
    const collaborationHandler = new CollaborationHandler(
      new CollaborationService(),
      new PlaylistService(),
      new UserService(),
      CollaborationValidator
    );
    server.route(routes(collaborationHandler));
  },
};
