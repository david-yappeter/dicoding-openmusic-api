const Joi = require('joi');

const SongPayloadSchema = (() => {
  const currentYear = new Date().getFullYear();

  return Joi.object({
    title: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(currentYear).required(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    duration: Joi.number().optional(),
    albumId: Joi.string().optional(),
  });
})();

module.exports = { SongPayloadSchema: SongPayloadSchema };
