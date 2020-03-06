const Joi = require("@hapi/joi");
const { register: registerUser, login: loginUser } = require("./service");

function register(req, res, next) {
  const schema = Joi.object({
    userName: Joi.string().min(1).max(50).required(),
    password: Joi.string().min(1).max(10).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).optional(),
    role: Joi.string().valid("student", "tutor").required(),
    department: Joi.string().required(),
    courses: Joi.array().items(Joi.string().required()).required()
  }).required();

  return schema
    .validateAsync(req.body)
    .then(details => registerUser(details))
    .then(details => handleSuccess(res, details))
    .catch(err => next(err));
}

function login(req, res, next) {
  const schema = Joi.object({
    userName: Joi.string().min(1).max(50).required(),
    password: Joi.string().min(1).max(50).required()
  }).required();

  return schema
    .validateAsync(req.body)
    .then(details => loginUser(details))
    .then(details => handleSuccess(res, details))
    .catch(err => next(err))
}

function handleSuccess(res, details) {
  res.send({
    success: true,
    details: { ...details }
  });
}

module.exports = {
  register,
  login
};
