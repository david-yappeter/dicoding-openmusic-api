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

  if (response.continue) {
    return response;
  }

  // Debugging Purpose
  // console.log(response);

  return response;
};

module.exports = {
  PanicHandler,
};
