const ClientError = require('./ClientError');

class UnauthorizedError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = 'Unauthorized';
  }
}

module.exports = UnauthorizedError;
