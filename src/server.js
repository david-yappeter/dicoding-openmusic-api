// Apply dotenv
require("dotenv").config();

const Hapi = require("@hapi/hapi");
const album = require("./api/album");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host:
      process.env.NODE_ENV === "production" ? process.env.HOST : "127.0.0.1",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register({ plugin: album });

  await server.start();
  console.log(`server start at ${server.info.uri}`);
};

init();
