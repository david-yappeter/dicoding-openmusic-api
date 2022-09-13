const { ErrorHandler } = require('../../util/util');

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler =
      this.deleteAuthenticationHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      // Validation
      this._validator.validatePostPlaylistPayload(request.payload);
      // Credentials
      const { id: credentialId } = request.auth.credentials;
      // Payload
      const { name } = request.payload;

      const playlistId = this._service.addPlaylist({
        name,
        owner: credentialId,
      });

      const response = h.response({
        status: 'success',
        data: {
          playlistId: playlistId,
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

module.exports = PlaylistHandler;
