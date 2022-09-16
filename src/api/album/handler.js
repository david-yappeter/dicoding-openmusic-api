class AlbumHandler {
  constructor(service, storageService, cacheService, validator) {
    this._service = service;
    this._storageService = storageService;
    this._cacheService = cacheService;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    // Validator
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({
      name: name,
      year: year,
    });

    const response = h.response({
      status: 'success',
      data: {
        albumId: albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this._service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album: album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    // Validation
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    const { name, year } = request.payload;

    await this._service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album Updated!',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album Deleted!',
    };
  }

  async postAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;
    this._validator.validateAlbumCoverPayload(cover.hapi.headers);

    await this._service.getAlbumById(id);

    const filename = await this._storageService.writeFile(cover, cover.hapi);

    await this._service.updateAlbumCover(
      id,
      `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`
    );

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;
    let likes;
    let response;
    // try get cached
    try {
      likes = await this._cacheService.get(`album:${id}`);
      response = h.response({
        status: 'success',
        data: {
          likes: parseInt(likes),
        },
      });
      response.header('X-Data-Source', 'cache');
    } catch (error) {
      likes = await this._service.getAlbumLikes(id);
      response = h.response({
        status: 'success',
        data: {
          likes: parseInt(likes),
        },
      });
    }

    return response;
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.getAlbumById(id);

    await this._service.likeAlbum({
      albumId: id,
      userId: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Liked',
    });
    response.code(201);
    return response;
  }
}

module.exports = AlbumHandler;
