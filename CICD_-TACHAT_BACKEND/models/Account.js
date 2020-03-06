function account(sequelize, Sequelize) {
    const Account = sequelize.define('Account', {
        accountId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'account_id'
        },
        firstName: {
            type: Sequelize.STRING,
            field: 'first_name',
            allowNull: false
        },
        userName: {
            type: Sequelize.STRING,
            field: 'user_name',
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            field: 'password',
            allowIsNull: false
        },
        lastName: {
            type: Sequelize.JSON,
            field: 'last_name'
        },
        accessKey: {
            type: Sequelize.STRING,
            field: 'access_key',
            allowNull: false
        },
        role: {
            type: Sequelize.ENUM('student', 'tutor'),
            field: 'role',
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
        tableName: 'account'
    });

    return Account;
}

module.exports = account;