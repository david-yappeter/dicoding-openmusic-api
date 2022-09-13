const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const SongService = require('./SongService');

class AlbumService {
  constructor() {
    this._pool = new Pool();
    this._songService = new SongService();
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

    return {
      ...result.rows[0],
      songs: songs,
    };
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
}

module.exports = AlbumService;
