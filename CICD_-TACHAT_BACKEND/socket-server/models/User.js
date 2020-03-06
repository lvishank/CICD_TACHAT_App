function user(sequelize, Sequelize) {
    const User = sequelize.define('User', {
        userId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'user_id'
        },
        userMeta: {
            type: Sequelize.JSON,
            field: 'user_meta',
            allowNull: false
        },
        accessKey: {
            type: Sequelize.STRING,
            field: 'access_key',
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
        tableName: 'user'
    });

    return User;
}

module.exports = user;