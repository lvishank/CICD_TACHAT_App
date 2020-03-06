function department(sequelize, Sequelize) {
    const Department = sequelize.define('Department', {
        departmentId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'department_id'
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
        isActive: {
            type: Sequelize.BOOLEAN,
            field: 'is_active',
            allowNull: false,
            defaultValue: true
        }
    }, {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'department',
        indexes: [
            {
                unique: true,
                fields: ['name']
            }
        ]
    });

    return Department;
}

module.exports = department;