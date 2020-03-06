class UnsupportedVersion extends Error {
    constructor(appVersion) {
        super('');
        this.errorCode = 400;
        this.errorType = 'UnsupportedVersionError';
        this.message = `Provided version ${appVersion} is unsupported.`
    }
}

class InvalidAccessKey extends Error {
    constructor(accessKey) {
        super('');
        this.errorCode = 400;
        this.errorType = 'InvalidAccessKey';
        this.message = `Provided user ${accessKey} doesn't exist`
    } 
}

class InvalidUserRoom extends Error {
    constructor(room) {
        super('');
        this.errorCode = 400;
        this.errorType = 'InvalidUserRoom';
        this.message = `Provided room '${room}' is not mapped to the user`
    } 
}

class MissingTokenInAuthorizationHeaders extends Error {
    constructor(room) {
        super('');
        this.errorCode = 400;
        this.errorType = 'MissingTokenInAuthorizationHeaders';
        this.message = `token missing in Authorization headers`
    } 
}

class RoomNotAssignedTouser extends Error {
    constructor(room) {
        super('');
        this.errorCode = 400;
        this.errorType = 'RoomNotAssignedTouser';
        this.message = `provided room '${room} is not assigned to user'`
    } 
}


module.exports = {
    UnsupportedVersion,
    InvalidAccessKey,
    InvalidUserRoom,
    MissingTokenInAuthorizationHeaders,
    RoomNotAssignedTouser
};