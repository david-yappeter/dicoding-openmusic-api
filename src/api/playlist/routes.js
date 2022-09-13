const routes = (handler) => [
  // {
  //   method: 'GET',
  //   path: '/playlists',
  //   handler: handler.getPlaylistsHandler,
  //   options: {
  //     auth: '_openmusic_jwt',
  //   },
  // },
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
    options: {
      auth: '_openmusic_jwt',
    },
  },
  // {
  //   method: 'DELETE',
  //   path: '/playlists/{id}',
  //   handler: handler.deleteByIdHandler,
  //   options: {
  //     auth: '_openmusic_jwt',
  //   },
  // },
];

module.exports = routes;
