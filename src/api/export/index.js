const routes = require('./routes');
const ExportHandler = require('./handler');
const ProducerService = require('../../service/rabbitmq/ProducerService');
const ExportValidator = require('../../validation/export');
const PlaylistService = require('../../service/postgres/PlaylistService');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server) => {
    const exportHandler = new ExportHandler(
      ProducerService,
      new PlaylistService(),
      ExportValidator
    );
    server.route(routes(exportHandler));
  },
};
