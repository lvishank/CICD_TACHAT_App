const express = require('express');
const { register, login } = require('./controller');

const router = express.Router();

// register user and in the system
router.post('/register', register);
// login user
router.post('/login', login);
// get chat history of a user

module.exports = router;