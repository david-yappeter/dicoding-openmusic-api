const routes = require('./routes');
const PlaylistHandler = require('./handler');
const PlaylistService = require('../../service/postgres/PlaylistService');
const PlaylistValidator = require('../../validation/playlist');

module.exports = {
  name: 'authentication',
  version: '1.0.0',
  register: async (server) => {
    const playlistHandler = new PlaylistHandler(
      new PlaylistService(),
      PlaylistValidator
    );
    server.route(routes(playlistHandler));
  },
};
