class UnsupportedVersion extends Error {
  constructor(appVersion) {
    super("");
    this.errorCode = 400;
    this.errorType = "UnsupportedVersionError";
    this.message = `Provided version ${appVersion} is unsupported.`;
  }
}

class MissingTokenInAuthorizationHeaders extends Error {
  constructor(room) {
    super("");
    this.errorCode = 400;
    this.errorType = "MissingTokenInAuthorizationHeaders";
    this.message = `token missing in Authorization headers`;
  }
}

class InvalidDepartment extends Error {
  constructor(department) {
    super("");
    this.errorCode = 400;
    this.errorType = "InvalidDepartment";
    this.message = `Provided department '${department}' doesn't exist `;
  }
}

class InvalidCourseInDepartment extends Error {
  constructor(course) {
    super("");
    this.errorCode = 400;
    this.errorType = "InvalidCourseInDepartment";
    this.message = `Provided course '${course}' is not mapped with the given department`;
  }
}

class UserNameAlreadyTaken extends Error {
  constructor(userName) {
    super("");
    this.errorCode = 400;
    this.errorType = "UserNameAlreadyTaken";
    this.message = `Provided username '${userName}' has already been taken. Try your luck with the other username!!!`;
  }
}

class InvalidUserNameOrPassword extends Error {
  constructor(userName) {
    super("");
    this.errorCode = 400;
    this.errorType = "InvalidUserNameOrPassword";
    this.message = `Invalid username or password`;
  }
}

class TutorsAlreadyForGivenCourse extends Error {
  constructor(course) {
    super("");
    this.errorCode = 400;
    this.errorType = "TutorsAlreadyForGivenCourse";
    this.message = `A tutor is already assigned for course '${course}'`;
  }
}

module.exports = {
  UnsupportedVersion,
  MissingTokenInAuthorizationHeaders,
  InvalidDepartment,
  InvalidCourseInDepartment,
  UserNameAlreadyTaken,
  InvalidUserNameOrPassword,
  TutorsAlreadyForGivenCourse
};
