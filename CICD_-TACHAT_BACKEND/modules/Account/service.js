const bcrypt = require("bcrypt");
const nodeChatClient = require("../../libs/nodeChatClient");
const {
  UserNameAlreadyTaken,
  InvalidUserNameOrPassword,
  TutorsAlreadyForGivenCourse
} = require("../../utils/errors");
const { getModel, createTransaction } = require("../../utils/models");
const {
  checkIfDepartmentExist,
  checkIfCourseExistInDepartment
} = require("../Department/service");

async function register({
  userName,
  password,
  firstName,
  lastName,
  role,
  department,
  // these are the list of courseId's for a department
  courses
}) {
  try {
    // check if the userName has already been taken
    const userNameDetails = await getAccountDetailsByUserName(userName);
    const hashedPassword = await bcrypt.hash(password, 10);

    if (userNameDetails) {
      throw new UserNameAlreadyTaken(userName);
    }

    // check if the given department and course exist
    const departmentDetails = await checkIfDepartmentExist(department);
    // check if the course under the given department exist
    const courseDepartmentMappingDetails = await checkIfCourseExistInDepartment(
      departmentDetails.departmentId,
      courses
    );

    // if the role is tutor, check if the tutor is already added for the given course
    if(role === 'tutor') {
      // get list of all students for this course
      const availableTutorsForCourses = await getUsersForGivenCourses(courses, "tutor");
      if(availableTutorsForCourses.length > 0) {
          throw new TutorsAlreadyForGivenCourse(courses[0]);
      }
    }

    // register user in the chat system
    const { details: { accessKey } } = await nodeChatClient.register();
    const transaction = await createTransaction();
    // create user
    const accountDetails = await getModel("Account").create(
      {
        userName,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        accessKey
      },
      { returning: true, transaction }
    );
    // add user course department mapping
    const userCourseDepartmentMappingDetails = courseDepartmentMappingDetails.map(
      ({ departmentCourseMappingId }) => {
        return {
          accountId: accountDetails.dataValues.accountId,
          departmentCourseMappingId
        };
      }
    );
    await getModel(
      "AccountDepartmentCourseMapping"
    ).bulkCreate(userCourseDepartmentMappingDetails, {
      transaction
    });

    // create session with chat system
    const { details: { token } } = await nodeChatClient.createSession(
      accessKey
    );
    // assign rooms
    let assignedRooms = [];
    let users = [];
    // for student create a room between student and tutor
    if (role === "student") {
      // assign a random room
      assignedRooms = courses.map(course => {
        return `course:${course}:${getRandomRoom()}`;
      });

      await nodeChatClient.assignRooms(accessKey, assignedRooms);
      users = await getUsersForGivenCourses(courses, "tutor");
    } else {
      // get list of all students for this course
      users = await getUsersForGivenCourses(courses, "student");
      // get rooms assigned for these students
      const promises = users.map(student => {
        return nodeChatClient
          .getUserRooms(student.accessKey)
          .then(({ details: studentAssignedRooms }) => {
            return courses.reduce((acc, course) => {
              const room = studentAssignedRooms.find(
                room => room.name.indexOf(`course:${course}`) !== -1
              );
              if (room) {
                // assign tutor the same room assigned to the tutor for this course
                acc.push(room.name);
              }
              return acc;
            }, []);
          });
      }, []);

      assignedRooms = await Promise.all(promises).then(rooms => {
        return rooms.reduce((acc, rooms) => {
          acc = acc.concat(rooms);
          return acc;
        }, []);
      });

      // this is the default room for the tutor to get global course related updates
      // not specific to students
      assignedRooms = assignedRooms.concat(
        courses.map(course => `course:${course}`)
      );
      await nodeChatClient.assignRooms(accessKey, assignedRooms);
    }

    transaction.commit();

    return {
      token,
      firstName,
      lastName,
      accessKey,
      department: departmentDetails.displayName,
      courses: courseDepartmentMappingDetails.map(({ name, displayName }) => ({
        name,
        displayName
      })),
      assignedRooms,
      [role === "student" ? "tutors" : "students"]: users
    };
  } catch (err) {
    throw err;
  }
}

async function login({ userName, password }) {
  try {
    // check if the userName exist
    const userDetails = await getAccountDetailsByUserName(userName);
    if (!userDetails) {
      throw new InvalidUserNameOrPassword();
    }
    const result = await bcrypt.compare(password, userDetails.password);
    if (result === false) {
      throw new InvalidUserNameOrPassword();
    }

    // get list of user courses
    const accountDepartmentCourseDetails = await getModel(
      "AccountDepartmentCourseMapping"
    ).findAll({
      where: {
        isActive: true,
        accountId: userDetails.accountId
      },
      include: [
        {
          attributes: ["name", "displayName"],
          model: getModel("DepartmentCourseMapping"),
          where: { isActive: true },
          include: [
            {
              attributes: ["name", "displayName"],
              model: getModel("Department"),
              where: { isActive: true }
            }
          ]
        }
      ],
      raw: true
    });

    const department =
      accountDepartmentCourseDetails[0]["DepartmentCourseMapping.displayName"];

    const courses = accountDepartmentCourseDetails.map(values => {
      return {
        name: values["DepartmentCourseMapping.name"],
        displayName: values["DepartmentCourseMapping.displayName"]
      };
    });
    const courseNames = courses.map(({ name }) => name);

    // create session with chat system
    const { details: { token } } = await nodeChatClient.createSession(
      userDetails.accessKey
    );
    // get rooms assigned to a user
    const { details: assignedRooms } = await nodeChatClient.getUserRooms(
      userDetails.accessKey
    );

    let users = await getUsersForGivenCourses(
      courseNames,
      userDetails.role === "student" ? "tutor" : "student"
    );

    const promises = users.map(details => {
      return nodeChatClient.getUserRooms(details.accessKey)
        .then(({ details: assignedRooms }) => {
          const assignedRoomsNames = assignedRooms.map(({ name }) => name);
          return {...details, assignedRooms: assignedRoomsNames};
        });
    });

    users = await Promise.all(promises);

    return {
      token,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      accessKey: userDetails.accessKey,
      department,
      courses,
      assignedRooms,
      [userDetails.role === "student" ? "tutors" : "students"]: users
    };
  } catch (err) {
    throw err;
  }
}

function getAccountDetailsByUserName(userName) {
  return getModel("Account").findOne({
    where: {
      userName
    }
  });
}

function getUsersForGivenCourses(courses, role) {
  const Account = getModel("Account");
  const DepartmentCourseMapping = getModel("DepartmentCourseMapping");
  const AccountDepartmentCourseMapping = getModel(
    "AccountDepartmentCourseMapping"
  );

  return AccountDepartmentCourseMapping.findAll({
    attributes: [],
    where: {
      isActive: true
    },
    include: [
      {
        attributes: ["name", "displayName"],
        model: DepartmentCourseMapping,
        where: {
          isActive: true,
          name: courses
        }
      },
      {
        model: Account,
        where: {
          isActive: true,
          role
        }
      }
    ],
    raw: true
  }).then(details =>
    details.map(detail => {
      return {
        accountId: detail["Account.accountId"],
        firstName: detail["Account.firstName"],
        lastName: detail["Account.lastName"],
        accessKey: detail["Account.accessKey"],
        course: {
          name: detail["DepartmentCourseMapping.name"],
          displayName: detail["DepartmentCourseMapping.displayName"]
        }
      };
    })
  );
}

function getRandomRoom() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return "_" + Math.random().toString(36).substr(2, 9);
}

module.exports = {
  register,
  login
};
