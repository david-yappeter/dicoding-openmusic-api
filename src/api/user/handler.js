const { ErrorHandler } = require('../../util/util');

class UserHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    try {
      this._validator.validateUserPayload(request.payload);

      const userId = await this._service.addUser(request.payload);
      const response = h.response({
        status: 'success',
        data: {
          userId: userId,
        },
      });
      response.code(201);
      return response;
    } catch (err) {
      console.log('AAA', err);
      return ErrorHandler(h, err);
    }
  }
}

module.exports = UserHandler;
