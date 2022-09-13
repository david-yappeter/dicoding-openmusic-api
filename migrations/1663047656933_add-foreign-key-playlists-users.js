/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.addConstraint(
    'playlists',
    'fk_playlists_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint('playlists', 'fk_playlists_users.id');
};
