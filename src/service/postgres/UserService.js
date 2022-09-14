const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/InvariantError');
const UnauthorizedError = require('../../exception/UnauthorizedError');
const NotFoundError = require('../../exception/NotFoundError');

class UserService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    // Verify Username Exist
    await this.verifyExistingUserName(username);

    const id = `usr-${nanoid(16)}`;
    const current_time = new Date().toISOString();
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users(id, username, password, fullname, created_at, updated_at) VALUES($1,lower($2),$3,$4,$5,$5) RETURNING id',
      values: [id, username, hashedPassword, fullname, current_time],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw InvariantError('Failed to create user');
    }

    return result.rows[0].id;
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT id, username FROM users WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('No Data');
    }

    return result.rows[0];
  }

  async verifyExistingUserName(username) {
    const query = {
      text: 'SELECT username FROM users WHERE lower(username) = lower($1)',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (result.rowCount > 0) {
      throw new InvariantError('Username Taken');
    }
  }

  async verifyUserCredential({ username, password }) {
    const query = {
      text: 'SELECT id, password FROM users WHERE lower(username) = lower($1)',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return id;
  }
}

module.exports = UserService;
