const routes = require('./routes');
const AlbumHandler = require('./handler');
const AlbumService = require('../../service/postgres/AlbumService');
const AlbumValidator = require('../../validation/album');
const CacheService = require('../../service/redis/CacheService');

module.exports = {
  name: 'album',
  version: '1.0.0',
  register: async (server, { storageService }) => {
    const albumHandler = new AlbumHandler(
      new AlbumService(),
      storageService,
      new CacheService(),
      AlbumValidator
    );
    server.route(routes(albumHandler));
  },
};
