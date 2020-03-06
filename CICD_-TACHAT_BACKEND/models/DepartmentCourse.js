function departmentCourseMapping(sequelize, Sequelize) {
    const DepartmentCourseMapping = sequelize.define('DepartmentCourseMapping', {
        departmentCourseMappingId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'department_course_mapping_id'
        },
        name: {
            type: Sequelize.STRING,
            field: 'name',
            allowNull: false
        },
        displayName: {
            type: Sequelize.STRING,
            field: 'display_name',
            allowNull: false
        },
        departmentId: {
            type: Sequelize.INTEGER,
            field: 'department_id',
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
        tableName: 'department_course_mapping',
        indexes: [
            {
                unique: true,
                fields: ['department_id', 'name']
            }
        ]
    });

    DepartmentCourseMapping.associate = (models) => {
        DepartmentCourseMapping.belongsTo(models.Department, {
            foreignKey: 'departmentId'
        });
    };

    return DepartmentCourseMapping;
}

module.exports = departmentCourseMapping;