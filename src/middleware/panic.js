const ClientError = require('../exception/ClientError');

const PanicHandler = (request, h) => {
  const { response } = request;
  if (response instanceof ClientError) {
    const newResponse = h.response({
      status: 'fail',
      message: response.message,
    });
    newResponse.code(response.statusCode);
    return newResponse;
  }
  return response.continue || response;
};

module.exports = {
  PanicHandler,
};