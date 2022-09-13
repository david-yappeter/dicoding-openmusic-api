const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const { mapSongToResponse } = require('../../util/util');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = nanoid(16);
    const current_time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO songs(id, title, year, genre, performer, duration, album_id, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id',
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        current_time,
        current_time,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to create song');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let result;
    if (title && performer) {
      result = await this._pool.query({
        text: 'SELECT id, title, performer FROM songs WHERE lower(title) LIKE lower($1) AND lower(performer) LIKE lower($2)',
        values: [`%${title}%`, `%${performer}%`],
      });
    } else if (title) {
      result = await this._pool.query({
        text: 'SELECT id, title, performer FROM songs WHERE lower(title) LIKE lower($1)',
        values: [`%${title}%`],
      });
    } else if (performer) {
      result = await this._pool.query({
        text: 'SELECT id, title, performer FROM songs WHERE lower(performer) LIKE lower($1)',
        values: [`%${performer}%`],
      });
    } else {
      result = await this._pool.query('SELECT id, title, performer FROM songs');
    }
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }

    return result.rows.map(mapSongToResponse)[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updated_at = new Date().toISOString();
    const query = {
      text: `UPDATE songs SET
        title = $1,
        year = $2,
        genre = $3,
        performer = $4,
        duration = $5,
        album_id = $6,
        updated_at = $7
        WHERE id = $8
        RETURNING id
      `,
      values: [
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        updated_at,
        id,
      ],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data Found');
    }
  }

  async getSongByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = SongService;
