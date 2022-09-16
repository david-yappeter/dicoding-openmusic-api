const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const ForbiddenError = require('../../exception/ForbiddenError');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const CacheService = require('../redis/CacheService');

class PlaylistService {
  constructor() {
    this._pool = new Pool();
    this._cacheService = new CacheService();
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

    this._cacheService.delete(`playlist:${owner}`);

    return result.rows[0].id;
  }

  async getPlaylists({ owner }) {
    let isCached = false;
    let result;
    try {
      result = JSON.parse(await this._cacheService.get(`playlist:${owner}`));
      isCached = true;
    } catch (error) {
      result = await this._pool.query({
        text: 'SELECT p.id, p.name, u.username FROM playlists p INNER JOIN users u ON p.owner = u.id LEFT JOIN collaborations c ON c.playlist_id = p.id WHERE (u.id = $1 OR c.user_id = $1)',
        values: [owner],
      });

      await this._cacheService.set(`playlist:${owner}`, JSON.stringify(result));
    }

    return { playlists: result.rows, isCached };
  }

  async getPlaylistById(id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Playlist Not Found');
    }

    return result.rows[0];
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

  async addPlaylistSong({ playlistId, songId, userId }) {
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO playlist_songs(id, playlist_id , song_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add song');
    }

    await this.addPlaylistSongActivity({
      playlistId,
      songId,
      userId,
      action: 'add',
      time: new Date().toISOString(),
    });

    return result.rows[0].id;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id, owner',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }

    this._cacheService.delete(`playlist:${result.rows[0].owner}`);
  }

  async deletePlaylistSongBySongId({ playlistId, songId, userId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }

    await this.addPlaylistSongActivity({
      playlistId,
      songId,
      userId,
      action: 'delete',
      time: new Date().toISOString(),
    });
  }

  async addPlaylistSongActivity({ playlistId, songId, userId, action, time }) {
    const id = `psa-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action, time) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to add activity');
    }
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: `SELECT s.title,  u.username, psa.action, psa.time
      FROM playlist_song_activities psa
      INNER JOIN playlists p on p.id = psa.playlist_id AND p.id = $1
      INNER JOIN users u on u.id = p.owner
      INNER JOIN playlist_songs ps on ps.playlist_id = p.id
      INNER JOIN songs s on s.id = psa.song_id
      `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async verifyPlaylistOwnerOnly({ id, owner }) {
    const query = {
      text: 'SELECT p.*, c.user_id FROM playlists p LEFT JOIN collaborations c on c.playlist_id = p.id where p.id = $1 AND p.owner = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new ForbiddenError('Access Denied');
    }
  }

  async verifyPlaylistOwner({ id, owner }) {
    const query = {
      text: 'SELECT p.*, c.user_id FROM playlists p LEFT JOIN collaborations c on c.playlist_id = p.id where p.id = $1 AND (p.owner = $2 OR c.user_id = $2)',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new ForbiddenError('Access Denied');
    }
  }
}

module.exports = PlaylistService;
