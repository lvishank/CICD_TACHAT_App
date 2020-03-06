function room(sequelize, Sequelize) {
    const Room = sequelize.define('Room', {
        roomId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'room_id'
        },
        name: {
            type: Sequelize.STRING,
            field: 'name',
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
        tableName: 'room'
    });

    return Room;
}

module.exports = room;