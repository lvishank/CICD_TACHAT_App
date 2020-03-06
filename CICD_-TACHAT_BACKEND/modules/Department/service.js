const { getModel } = require("../../utils/models");
const {
  InvalidDepartment,
  InvalidCourseInDepartment
} = require("../../utils/errors");

async function addMasterRecords() {
  try {
    // check if the required departments has been added
    const departmentCourseMapping = [
      {
        name: "computerScience",
        displayName: "Computer Science",
        courses: [
          { name: "course1", displayName: "Course-1" },
          { name: "course2", displayName: "Course-2" }
        ]
      },
      {
        name: "softwareEngineering",
        displayName: "Software Engineering",
        courses: [
          { name: "course1", displayName: "Course-1" },
          { name: "course2", displayName: "Course-2" }
        ]
      },
      {
        name: "computerInformationScience",
        displayName: "Computer Information Science",
        courses: [
          { name: "course1", displayName: "Course-1" },
          { name: "course2", displayName: "Course-2" }
        ]
      },
      {
        name: "engineeringManagement",
        displayName: "Engineering Management",
        courses: [
          { name: "course1", displayName: "Course-1" },
          { name: "course2", displayName: "Course-2" }
        ]
      }
    ];

    const departments = departmentCourseMapping.map(
      ({ name, displayName }) => ({
        name,
        displayName
      })
    );
    const departmentDetails = await getModel(
      "Department"
    ).bulkCreate(departments, {
      ignoreDuplicates: true,
      returning: true
    });

    const departmentCourses = departmentDetails.reduce((acc, value) => {
      const departmentId = value.dataValues.departmentId;
      const departmentName = value.dataValues.name;
      const courses = departmentCourseMapping.find(
        ({ name }) => name === departmentName
      ).courses;
      const coursesToAdd = courses.map(value => {
        return { departmentId, ...value };
      });
      acc = acc.concat(coursesToAdd);
      return acc;
    }, []);
    await getModel("DepartmentCourseMapping").bulkCreate(departmentCourses, {
      ignoreDuplicates: true
    });
  } catch (err) {
    throw err;
  }
}

function checkIfDepartmentExist(department) {
  return getModel("Department")
    .findOne({
      where: {
        name: department,
        isActive: true
      },
      raw: true
    })
    .then(details => {
      if (!details) {
        throw new InvalidDepartment(department);
      }
      return details;
    });
}

function checkIfCourseExistInDepartment(departmentId, courses) {
  return getModel("DepartmentCourseMapping")
    .findAll({
      where: {
        departmentId,
        name: courses,
        isActive: true
      },
      raw: true
    })
    .then(details => {
      courses.map(course => {
        const mappingExist = details.find(
          courseDepartmentDetails =>
            courseDepartmentDetails.name === course &&
            courseDepartmentDetails.departmentId
        );

        if (!mappingExist) {
          throw new InvalidCourseInDepartment(course);
        }
      });
      return details;
    });
}

module.exports = {
  addMasterRecords,
  checkIfDepartmentExist,
  checkIfCourseExistInDepartment
};
