const Joi = require('joi');

const AlbumPayloadSchema = (() => {
  const currentYear = new Date().getFullYear();
  return Joi.object({
    name: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(currentYear).required(),
  });
})();

module.exports = { AlbumPayloadSchema: AlbumPayloadSchema };
