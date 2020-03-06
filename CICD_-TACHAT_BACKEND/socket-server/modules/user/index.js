const express = require('express');
const { register, createSession, assignRooms, getUserRooms } = require('./controller');

const router = express.Router();

// register user and in the system
router.post('/register', register);
// create session for the user
router.post('/:accessKey/session', createSession);
// assign rooms to user
router.post('/:accessKey/rooms/', assignRooms);
// get list of rooms assigned to user
router.get('/:accessKey/rooms', getUserRooms);

module.exports = router;