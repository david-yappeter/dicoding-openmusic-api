const { ErrorHandler } = require("../../util/util");

class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const songId = await this._service.addSong(request.payload);
      const response = h.response({
        status: "success",
        data: {
          songId: songId,
        },
      });
      response.code(201);
      return response;
    } catch (err) {
      return ErrorHandler(h, err);
    }
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;

    const songs = await this._service.getSongs({ title, performer });
    return {
      status: "success",
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);

      return {
        status: "success",
        data: {
          song: song,
        },
      };
    } catch (err) {
      return ErrorHandler(h, err);
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      // Validator
      this._validator.validateSongPayload(request.payload);

      const { id } = request.params;
      await this._service.editSongById(id, request.payload);

      return {
        status: "success",
        message: "Song Updated!",
      };
    } catch (err) {
      return ErrorHandler(h, err);
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);
      return {
        status: "success",
        message: "Song Deleted!",
      };
    } catch (err) {
      return ErrorHandler(h, err);
    }
  }
}

module.exports = SongHandler;