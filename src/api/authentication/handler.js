const { ErrorHandler } = require('../../util/util');

class AuthenticationsHandler {
  constructor(authenticationService, userService, tokenManager, validator) {
    this._authenticationsService = authenticationService;
    this._userService = userService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler =
      this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      // Validation
      this._validator.validatePostAuthenticationPayload(request.payload);

      const { username, password } = request.payload;
      const id = await this._userService.verifyUserCredential({
        username,
        password,
      });

      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });

      await this._authenticationsService.addRefreshToken(refreshToken);

      const response = h.response({
        status: 'success',
        message: 'Authentication Success',
        data: {
          accessToken,
          refreshToken,
        },
      });
      response.code(201);
      return response;
    } catch (err) {
      return ErrorHandler(h, err);
    }
  }

  async putAuthenticationHandler(request, h) {
    try {
      // Validator
      this._validator.validatePutAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ id });
      return {
        status: 'success',
        message: 'Access Token Updated!',
        data: {
          accessToken,
        },
      };
    } catch (err) {
      return ErrorHandler(h, err);
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      // Validator
      this._validator.validateDeleteAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;
      await this._authenticationsService.verifyRefreshToken(refreshToken);
      await this._authenticationsService.deleteRefreshToken(refreshToken);

      return {
        status: 'success',
        message: 'Refresh token berhasil dihapus',
      };
    } catch (err) {
      return ErrorHandler(h, err);
    }
  }
}

module.exports = AuthenticationsHandler;
