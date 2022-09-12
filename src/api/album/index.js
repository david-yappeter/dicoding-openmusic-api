const routes = require('./routes');
const AlbumHandler = require('./handler');
const AlbumService = require('../../service/postgres/AlbumService');
const AlbumValidator = require('../../validation/album');

module.exports = {
  name: 'album',
  version: '1.0.0',
  register: async (server) => {
    const albumHandler = new AlbumHandler(new AlbumService(), AlbumValidator);
    server.route(routes(albumHandler));
  },
};
