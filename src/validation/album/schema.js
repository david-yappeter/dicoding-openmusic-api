const Joi = require('joi');

const AlbumPayloadSchema = (() => {
  const currentYear = new Date().getFullYear();
  return Joi.object({
    name: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(currentYear).required(),
  });
})();

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string()
    .valid(
      'image/apng',
      'image/avif',
      'image/gif',
      'image/jpg',
      'image/jpeg',
      'image/png',
      'image/webp'
    )
    .required(),
}).unknown();

module.exports = { AlbumPayloadSchema, ImageHeadersSchema };
