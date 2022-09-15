// Apply dotenv
require('dotenv').config();
const path = require('path');

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');

const album = require('./api/album');
const song = require('./api/song');
const user = require('./api/user');
const authentication = require('./api/authentication');
const playlist = require('./api/playlist');
const collaboration = require('./api/collaboration');
const exportPlug = require('./api/export');

const { PanicHandler } = require('./middleware/panic');
const StorageService = require('./service/storage/StorageService');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host:
      process.env.NODE_ENV === 'production' ? process.env.HOST : '127.0.0.1',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([{ plugin: Jwt }, { plugin: Inert }]);
  server.ext('onPreResponse', PanicHandler);

  // JWT Strategy
  server.auth.strategy('_openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: album,
      options: {
        storageService: new StorageService(
          path.resolve(__dirname, 'api/uploads/file/images')
        ),
      },
    },
    { plugin: song },
    { plugin: user },
    { plugin: authentication },
    { plugin: playlist },
    { plugin: collaboration },
    { plugin: exportPlug },
  ]);

  await server.start();
  console.log(`server start at ${server.info.uri}`);
};

init();
