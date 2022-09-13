const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/InvariantError');

class UserService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    // Verify Username Exist
    this.verifyExistingUserName(username);

    const id = `usr-${nanoid(16)}`;
    const current_time = new Date().toISOString();
    const hashedPassword = bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users(id, username, password, fullname, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      values: [
        id,
        username,
        hashedPassword,
        fullname,
        current_time,
        current_time,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw InvariantError('Failed to create user');
    }

    return result.rows[0].id;
  }

  async verifyExistingUserName(username) {
    const query = {
      text: 'SELECT username FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Username Taken');
    }
  }
}

module.exports = UserService;
