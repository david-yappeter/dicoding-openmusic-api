const InvariantError = require('../../exception/InvariantError');
const { UserPayloadSchema } = require('./schema');

const UserValidator = {
  validateSongPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UserValidator;
