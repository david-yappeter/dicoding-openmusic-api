class Listener {
  constructor(playlistService, mailSender) {
    this._playlistService = playlistService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    const content = JSON.parse(message.content.toString());
    const { playlistId, targetEmail } = content;

    const playlist = await this._playlistService.getPlaylistByIdWithSongs(
      playlistId
    );
    const result = await this._mailSender.sendEmail(
      targetEmail,
      JSON.stringify(playlist)
    );
    console.log(result);
  }
}

module.exports = Listener;
