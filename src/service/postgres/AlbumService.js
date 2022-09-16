const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const CacheService = require('../redis/CacheService');
const SongService = require('./SongService');

class AlbumService {
  constructor() {
    this._pool = new Pool();
    this._songService = new SongService();
    this._cacheService = new CacheService();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const current_time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO albums (id, name, year, created_at, updated_at) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, current_time, current_time],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to create album');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query('SELECT * FROM albums');
    return result.rows;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }

    const songs = await this._songService.getSongByAlbumId(result.rows[0].id);

    const data = {
      ...result.rows[0],
      coverUrl: result.rows[0].cover,
      songs: songs,
    };
    delete data.cover;
    return data;
  }

  async editAlbumById(id, { name, year }) {
    const updated_at = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updated_at, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }
  }

  async updateAlbumCover(id, cover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [cover, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }
  }

  async getAlbumLikes(id) {
    const query = {
      text: 'SELECT COUNT(*)  as count FROM user_album_likes WHERE album_id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    await this._cacheService.set(`album:${id}`, result.rows[0].count);
    return result.rows[0].count;
  }

  async likeAlbum({ albumId, userId }) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE album_id = $1 AND user_id = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      const resultCreate = await this._pool.query({
        text: 'INSERT INTO user_album_likes(id, album_id, user_id) VALUES($1,$2,$3)',
        values: [`like-${nanoid(16)}`, albumId, userId],
      });

      if (!resultCreate.rowCount) {
        throw new InvariantError('Failed to Like');
      }
    }
    await this._cacheService.delete(`album:${albumId}`);
  }
}

module.exports = AlbumService;
