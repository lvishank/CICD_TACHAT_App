function accountDepartmentCourseMapping(sequelize, Sequelize) {
    const AccountDepartmentCourseMapping = sequelize.define('AccountDepartmentCourseMapping', {
        accountDepartmentCourseMappingId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'account_department_course_mapping_id'
        },
        accountId: {
            type: Sequelize.INTEGER,
            field: 'account_id',
            allowNull: false
        },
        departmentCourseMappingId: {
            type: Sequelize.INTEGER,
            field: 'department_course_mapping_id',
            allowNull: false
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            field: 'is_active',
            allowNull: false,
            defaultValue: true
        }
    }, {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'account_department_course_mapping'
    });

    AccountDepartmentCourseMapping.associate = (models) => {
        AccountDepartmentCourseMapping.belongsTo(models.Account, {
            foreignKey: 'accountId'
        });
        AccountDepartmentCourseMapping.belongsTo(models.DepartmentCourseMapping, {
            foreignKey: 'departmentCourseMappingId'
        });
    };

    return AccountDepartmentCourseMapping;
}

module.exports = accountDepartmentCourseMapping;