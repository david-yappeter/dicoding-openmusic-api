// Apply dotenv
require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const album = require('./api/album');
const song = require('./api/song');
const { PanicHandler } = require('./middleware/panic');

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

  await server.register({ plugin: Jwt });

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

  await server.register([{ plugin: album }, { plugin: song }]);

  server.ext('onPreResponse', PanicHandler);

  await server.start();
  console.log(`server start at ${server.info.uri}`);
};

init();
