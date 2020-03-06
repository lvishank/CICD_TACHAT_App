const { MissingTokenInAuthorizationHeaders } = require('../utils/errors');

function getTokenFromHeaders(headers) {
    const authorizationHeaders = headers.authorization && headers.authorization.split(' ') || []; 
    if(authorizationHeaders.length > 0 && authorizationHeaders[0].toLowerCase() === 'token') {
        token = authorizationHeaders[1];
        return token;
    } else {
        throw new MissingTokenInAuthorizationHeaders();
    }
}

module.exports = {
    getTokenFromHeaders
};