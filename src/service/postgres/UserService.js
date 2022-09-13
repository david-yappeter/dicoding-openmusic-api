const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/InvariantError');
const UnauthorizedError = require('../../exception/UnauthorizedError');

class UserService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    // Verify Username Exist
    this.verifyExistingUserName(username);

    const id = `usr-${nanoid(16)}`;
    const hashedPassword = bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users(id, username, password, fullname) VALUES($1,lower($2),$3,$4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    console.log(result.rowCount);
    if (!result.rowCount) {
      throw InvariantError('Failed to create user');
    }

    return result.rows[0].id;
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
