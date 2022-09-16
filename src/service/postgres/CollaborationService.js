const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/NotFoundError');
const CacheService = require('../redis/CacheService');

class CollaborationService {
  constructor() {
    this._pool = new Pool();
    this._cacheService = new CacheService();
  }

  async addCollaboration({ playlistId, userId }) {
    const id = `collab-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO collaborations(id, playlist_id, user_id) VALUES($1,$2,$3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Failed to add collaborator');
    }

    return result.rows[0].id;
  }

  async deleteCollaboration({ playlistId, userId }) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No data found');
    }

    this._cacheService.delete(`playlist:${userId}`);
    return result.rows[0].id;
  }
}

module.exports = CollaborationService;
