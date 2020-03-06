function userChatMessage(sequelize, Sequelize) {
    const UserChatMessage = sequelize.define('UserChatMessage', {
        userChatMessageId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'user_chat_message_id'
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
        message: {
            type: Sequelize.STRING,
            field: 'message',
            allowNull: false
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            field: 'is_active',
            allowNull: false,
            defaultValue: true
        },
        createdAt: {
            type: 'TIMESTAMP',
            field: 'created_at'
        }
    }, {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'user_chat_message'
    });

    UserChatMessage.associate = (models) => {
        UserChatMessage.belongsTo(models.User, {
            foreignKey: 'userId'
        });
        UserChatMessage.belongsTo(models.Room, {
            foreignKey: 'roomId'
        });
    };

    return UserChatMessage;
}

module.exports = userChatMessage;