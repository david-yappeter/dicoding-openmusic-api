const InvariantError = require('../../exception/InvariantError');
const { AlbumPayloadSchema, ImageHeadersSchema } = require('./schema');

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAlbumCoverPayload: (payload) => {
    const validationResult = ImageHeadersSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumValidator;
