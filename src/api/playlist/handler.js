class PlaylistHandler {
  constructor(playlistService, songService, cacheService, validator) {
    this._service = playlistService;
    this._songService = songService;
    this._cacheService = cacheService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getPlaylistByIdWithSongsHandler =
      this.getPlaylistByIdWithSongsHandler.bind(this);
    this.getPlaylistSongActivitiesHandler =
      this.getPlaylistSongActivitiesHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    // Validation
    this._validator.validatePlaylistPayload(request.payload);
    // Credentials
    const { id: credentialId } = request.auth.credentials;
    // Payload
    const { name } = request.payload;

    const playlistId = await this._service.addPlaylist({
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
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { playlists, isCached } = await this._service.getPlaylists({
      owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    if (isCached) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }

  async postPlaylistSongHandler(request, h) {
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._validator.validatePlaylistSongPayload(request.payload);
    // Throw Bad Request if no Song found
    await this._songService.getSongById(songId);

    await this._service.verifyPlaylistOwner({ id: id, owner: credentialId });

    await this._service.addPlaylistSong({
      playlistId: id,
      userId: credentialId,
      songId,
    });

    const response = h.response({
      status: 'success',
      message: 'Song  Added',
    });
    response.code(201);
    return response;
  }

  async getPlaylistByIdWithSongsHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const playlist = await this._service.getPlaylistByIdWithSongs(id);
    await this._service.verifyPlaylistOwner({ id: id, owner: credentialId });

    return {
      status: 'success',
      data: {
        playlist: playlist,
      },
    };
  }

  async getPlaylistSongActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // Check Playlist Exist
    await this._service.getPlaylistById(id);
    // Verify Access
    await this._service.verifyPlaylistOwner({ id: id, owner: credentialId });

    const activities = await this._service.getPlaylistSongActivities(id);

    return {
      status: 'success',
      data: {
        playlistId: id,
        activities: activities,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwnerOnly({
      id: id,
      owner: credentialId,
    });

    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Deleted!',
    };
  }

  async deletePlaylistSongHandler(request) {
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._validator.validatePlaylistSongPayload(request.payload);
    // Throw Bad Request if no Song found
    await this._songService.getSongById(songId);

    await this._service.verifyPlaylistOwner({ id: id, owner: credentialId });

    await this._service.deletePlaylistSongBySongId({
      playlistId: id,
      userId: credentialId,
      songId,
    });

    return {
      status: 'success',
      message: 'Song removed',
    };
  }
}

module.exports = PlaylistHandler;
