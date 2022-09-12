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

function mapSongToResponseList(song) {
  return {
    id: song.id,
    title: song.title,
    performer: song.performer,
  };
}

function mapSongToResponse(song) {
  return {
    id: song.id,
    title: song.title,
    year: song.year,
    genre: song.genre,
    performer: song.performer,
    duration: song.duration,
    albumId: song.album_id,
    created_at: song.created_at,
    updated_at: song.updated_at,
  };
}

module.exports = {
  ErrorHandler,
  mapSongToResponseList,
  mapSongToResponse,
};
