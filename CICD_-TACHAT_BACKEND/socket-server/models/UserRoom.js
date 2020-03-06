function userRoom(sequelize, Sequelize) {
    const UserRoom = sequelize.define('UserRoomMapping', {
        userRoomId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'user_room_id'
        },
        userId: {
            type: Sequelize.INTEGER,
            field: 'user_id',
            allowNull: false
        },
        roomId: {
            type: Sequelize.INTEGER,
            field: 'room_id',
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
        tableName: 'user_room_mapping'
    });

    UserRoom.associate = (models) => {
        UserRoom.belongsTo(models.Room, {
            foreignKey: 'roomId'
        });
        UserRoom.belongsTo(models.User, {
            foreignKey: 'userId'
        });
    };

    return UserRoom;
}

module.exports = userRoom;