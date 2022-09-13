const { Pool } = require('pg');
const InvariantError = require('../../exception/InvariantError');

class AuthenticationService {
  constructor() {
    this._pool = new Pool();
  }

  async addRefreshToken(refreshToken) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [refreshToken],
    };

    await this._pool.query(query);
  }

  async verifyRefreshToken(refreshToken) {
    const query = {
      text: 'SELECT * FROM authentications WHERE id = $1',
      values: [refreshToken],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Refresh Token Not Valid');
    }
  }

  async deleteRefreshToken(refreshToken) {
    const query = {
      text: 'DELETE FROM authentications where id = $1',
      values: [refreshToken],
    };

    await this._pool.query(query);
  }
}

module.exports = AuthenticationService;
