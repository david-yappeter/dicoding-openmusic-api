const routes = require('./routes');
const SongHandler = require('./handler');
const SongService = require('../../service/postgres/SongService');
const SongValidator = require('../../validation/song');

module.exports = {
  name: 'song',
  version: '1.0.0',
  register: async (server) => {
    const songHandler = new SongHandler(new SongService(), SongValidator);
    server.route(routes(songHandler));
  },
};
