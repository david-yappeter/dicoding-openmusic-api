const routes = require('./routes');
const PlaylistHandler = require('./handler');
const PlaylistService = require('../../service/postgres/PlaylistService');
const SongService = require('../../service/postgres/SongService');
const PlaylistValidator = require('../../validation/playlist');
const CacheService = require('../../service/redis/CacheService');

module.exports = {
  name: 'authentication',
  version: '1.0.0',
  register: async (server) => {
    const playlistHandler = new PlaylistHandler(
      new PlaylistService(),
      new SongService(),
      new CacheService(),
      PlaylistValidator
    );
    server.route(routes(playlistHandler));
  },
};
