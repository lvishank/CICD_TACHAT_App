const jwt = require('jsonwebtoken');
const salt = 'xONGlJKm9r';

function create(details) {
    return jwt.sign(details, 'xONGlJKm9r');
}

function verify(token) {
    return jwt.verify(token, salt);
}

module.exports = {
    create,
    verify
};