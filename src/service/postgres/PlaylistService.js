const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const ForbiddenError = require('../../exception/ForbiddenError');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO playlists(id, name, owner) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to create song');
    }

    return result.rows[0].id;
  }

  async getPlaylists({ owner }) {
    const result = await this._pool.query({
      text: 'SELECT p.id, p.name, u.username FROM playlists p INNER JOIN users u ON p.owner = u.id WHERE u.id = $1',
      values: [owner],
    });
    return result.rows;
  }

  async getPlaylistByIdWithSongs(id) {
    const query = {
      text: 'SELECT p.id, p.name, u.username FROM playlists p INNER JOIN users u ON p.owner = u.id WHERE p.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist Not Found');
    }

    const songsResult = await this._pool.query({
      text: 'SELECT s.id, s.title, s.performer FROM playlist_songs ps INNER JOIN songs s on s.id = ps.song_id WHERE ps.playlist_id = $1',
      values: [id],
    });

    return {
      ...result.rows[0],
      songs: songsResult.rows,
    };
  }

  async addPlaylistSong({ playlistId, songId }) {
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO playlist_songs(id, playlist_id , song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song');
    }

    return result.rows[0].id;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }
  }

  async deletePlaylistSongBySongId({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }
  }

  async verifyPlaylistOwner({ id, owner }) {
    const query = {
      text: 'SELECT * FROM playlists where id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist Not Found');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new ForbiddenError('Access Denied');
    }
  }
}

module.exports = PlaylistService;
