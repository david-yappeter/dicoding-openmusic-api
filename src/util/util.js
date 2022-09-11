const ClientError = require("../exception/ClientError");

function ErrorHandler(h, error) {
  if (error instanceof ClientError) {
    const response = h.response({
      status: "fail",
      message: error.message,
    });
    response.code(error.statusCode);
    return response;
  }

  // Internal System Error
  const response = h.response({
    status: "error",
    message: "Internal System Error",
  });
  response.code(500);
  console.log(error);
  return response;
}

module.exports = {
  ErrorHandler,
};
