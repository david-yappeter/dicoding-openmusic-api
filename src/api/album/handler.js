const ClientError = require("../../exception/ClientError");
const { ErrorHandler } = require("../../util/util");

class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      // Validator
      this._validator.validateAlbumPayload(request.payload);

      const { name, year } = request.payload;

      const albumId = await this._service.addAlbum({
        name: name,
        year: year,
      });

      const response = h.response({
        status: "success",
        data: {
          albumId: albumId,
        },
      });

      response.code(201);
      return response;
    } catch (error) {
      return ErrorHandler(h, error);
    }
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: "success",
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);
      return {
        status: "success",
        data: {
          album: album,
        },
      };
    } catch (error) {
      return ErrorHandler(h, error);
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      // Validation
      this._validator.validateAlbumPayload(request.payload);

      const { id } = request.params;
      const { name, year } = request.payload;

      await this._service.editAlbumById(id, { name, year });

      return {
        status: "success",
        message: "Album Updated!",
      };
    } catch (error) {
      return ErrorHandler(h, error);
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;

      await this._service.deleteAlbumById(id);

      return {
        status: "success",
        message: "Album Deleted!",
      };
    } catch (error) {
      return ErrorHandler(h, error);
    }
  }
}

module.exports = AlbumHandler;