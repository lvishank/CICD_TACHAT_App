const { getModel } = require("../../utils/models");

async function createRoomsIfNotExist(rooms, transaction = null) {
  let selectedRooms = await getSelectedRooms(rooms);
  const records = rooms.reduce((acc, room) => {
    const roomExist = selectedRooms.find(({ name }) => name === room);
    if (!roomExist) {
      acc.push({
        name: room
      });
    }
    return acc;
  }, []);
  let returnedRecords = await getModel("Room").bulkCreate(records, {
    returning: true,
    transaction
  });
  returnedRecords = returnedRecords.map(({ dataValues }) => dataValues);
  selectedRooms = selectedRooms.concat(returnedRecords);
  return rooms.map(room => {
    return selectedRooms.find(({ name }) => name === room);
  });
}

function getSelectedRooms(rooms) {
  return getModel("Room").findAll({
    where: {
      isActive: true,
      name: rooms
    },
    raw: true
  });
}

module.exports = {
  createRoomsIfNotExist,
  getSelectedRooms
};
