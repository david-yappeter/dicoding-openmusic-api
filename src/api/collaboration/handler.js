class CollaborationHandler {
  constructor(service, playlistService, userService, validator) {
    this._service = service;
    this._playlistService = playlistService;
    this._userService = userService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler =
      this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    // Validator
    await this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    // Check user exist
    await this._userService.getUserById(userId);
    // Check Playlist exist
    await this._playlistService.getPlaylistById(playlistId);

    await this._playlistService.verifyPlaylistOwnerOnly({
      id: playlistId,
      owner: credentialId,
    });

    const collaborationId = await this._service.addCollaboration({
      playlistId,
      userId,
    });

    const response = h.response({
      status: 'success',
      data: {
        collaborationId: collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    // Validator
    await this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwnerOnly({
      id: playlistId,
      owner: credentialId,
    });

    await this._service.deleteCollaboration({
      playlistId,
      userId,
    });

    return {
      status: 'success',
      message: 'collaborator removed',
    };
  }
}

module.exports = CollaborationHandler;
