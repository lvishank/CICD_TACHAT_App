const Joi = require("@hapi/joi");
const UserService = require("./service");
const { verify } = require("../../utils/token");
const { getTokenFromHeaders } = require("../../utils/header");

function register(req, res, next) {
  const schema = Joi.object({
    userMeta: Joi.object().optional()
  }).optional();

  return schema
    .validateAsync(req.body)
    .then(details => {
      return UserService.register(details);
    })
    .then(details => handleSuccess(res, details))
    .catch(err => next(err));
}

function createSession(req, res, next) {
  const schema = Joi.object({
    accessKey: Joi.string()
  }).required();

  return schema
    .validateAsync(req.params)
    .then(details => {
      return UserService.createSession(details.accessKey);
    })
    .then(details => handleSuccess(res, details))
    .catch(err => next(err));
}

function assignRooms(req, res, next) {
  //const token = getTokenFromHeaders(req.headers);
  const accessKey = req.params.accessKey;
  const schema = Joi.object({
    rooms: Joi.array().items(Joi.string().min(1).max(50).required()).required()
  }).required();

  return (
    schema
      .validateAsync(req.body)
      //.then(_ => verify(token))
      .then(details => UserService.assignRooms(accessKey, details.rooms, true))
      .then(details => handleSuccess(res, details))
      .catch(err => next(err))
  );
}

function getUserRooms(req, res, next) {
  const accessKey = req.params.accessKey;
  return UserService.getUserRooms(accessKey)
    .then(details => handleSuccess(res, details))
    .catch(err => next(err));
}

function createSocketSession(socketId, details) {
  const schema = Joi.object({
    token: Joi.string().required(),
    rooms: Joi.array().items(Joi.string().optional()).optional(),
    broadcaseMyPresenceToRooms: Joi.array()
      .items(Joi.string().optional())
      .optional()
  }).required();

  return schema
    .validateAsync(details)
    .then(({ token }) => verify(token))
    .then(({ accessKey }) =>
      UserService.createSocketSession(socketId, accessKey, details.rooms)
    );
}

function removeSocketSession(socketId) {
  return UserService.removeSocketSession(socketId).then(({ accessKey }) =>
    UserService.getUserRooms(accessKey).then(userRooms => {
      return {
        accessKey,
        userRooms
      };
    })
  );
}

function addChatMessage(socketId, details) {
  const schema = Joi.object({
    token: Joi.string().required(),
    room: Joi.string().required(),
    message: Joi.string().min(1).max(100).required()
  }).required();

  return schema
    .validateAsync(details)
    .then(({ token }) => verify(token))
    .then(({ accessKey }) =>
      UserService.addChatMessage(accessKey, details).then(_ => ({ accessKey }))
    );
}

function getUsersAccessKeyBySocketSession(sockets) {
  return UserService.getUsersAccessKeyBySocketSession(sockets);
}

function getUserChatRoomHistory(details) {
  const schema = Joi.object({
    token: Joi.string().required(),
    room: Joi.string().required()
  }).required();

  return schema
    .validateAsync(details)
    .then(({ token }) => verify(token))
    .then(({ accessKey }) =>
      UserService.getUserChatRoomHistory(accessKey, details.room)
    );
}

function handleSuccess(res, details) {
  res.send({
    success: true,
    details
  });
}

module.exports = {
  register,
  createSession,
  assignRooms,
  getUserRooms,
  createSocketSession,
  removeSocketSession,
  addChatMessage,
  getUsersAccessKeyBySocketSession,
  getUserChatRoomHistory
};
