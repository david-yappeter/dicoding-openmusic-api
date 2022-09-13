const ClientError = require('./ClientError');

class UnauthenticatedError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = 'Unauthorized';
  }
}

module.exports = UnauthenticatedError;
