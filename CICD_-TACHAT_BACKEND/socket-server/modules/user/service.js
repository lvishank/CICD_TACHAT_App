const redis = require("../../utils/redis");
const { create: createToken } = require("../../utils/token");
const { getModel, createTransaction, column } = require("../../utils/models");
const {
  InvalidAccessKey,
  InvalidUserRoom,
  RoomNotAssignedTouser
} = require("../../utils/errors");
const { createRoomsIfNotExist } = require("../rooms/service");

async function register({ userMeta = {} }) {
  try {
    const accessKey = generateAccessKey();
    // create user
    const userDetails = await getModel("User").create(
      {
        accessKey,
        userMeta
      },
      { returning: true }
    );
    return { accessKey };
  } catch (err) {
    throw err;
  }
}

async function createSession(accessKey) {
  try {
    const userDetails = await checkIfUserExistByAccessKey(accessKey);

    // create a JWT token
    const token = await createToken({ accessKey });

    return { token };
  } catch (err) {
    throw err;
  }
}

async function assignRooms(
  accessKey,
  rooms,
  deactivateRoomsInPreviousSession = false
) {
  try {
    const transaction = await createTransaction();
    const userDetails = await checkIfUserExistByAccessKey(accessKey);
    // get room details if exist
    const selectedRooms = await createRoomsIfNotExist(rooms, transaction);
    // get user mapped rooms, activate rooms which are inactive,
    // add rooms for user which are not mapped
    const UserRoomMappingModel = getModel("UserRoomMapping");
    const userAssignedRooms = await getUserRooms(accessKey, true);
    let records = selectedRooms.reduce(
      (acc, room) => {
        const roomDetails = userAssignedRooms.find(
          ({ roomId }) => roomId === room.roomId
        );
        console.log(roomDetails);
        if (!roomDetails) {
          // map room
          acc.add.push({
            userId: userDetails.userId,
            roomId: room.roomId
          });
        } else {
          if (!roomDetails.isActive) {
            // make room active for user
            acc.update.push({
              userId: userDetails.userId,
              roomId: room.roomId
            });
          }
        }
        return acc;
      },
      {
        add: [],
        update: []
      }
    );

    if (deactivateRoomsInPreviousSession) {
      // disable rooms which are not assigned in this session
      // and is running in previous session
      records.delete = userAssignedRooms.reduce((acc, room) => {
        const roomIndex = rooms.indexOf(room.name);
        if (roomIndex === -1 && room.isActive) {
          acc.push({
            userId: userDetails.userId,
            roomId: room.roomId
          });
        }
        return acc;
      }, []);
      console.log("delete", records.delete);
    }

    let promises = [];
    if (records.add.length > 0) {
      promises.push(
        UserRoomMappingModel.bulkCreate(records.add, {
          transaction
        })
      );
    }
    if (records.update.length > 0) {
      const updatePromises = records.update.map(record => {
        return UserRoomMappingModel.update(
          { isActive: true },
          {
            where: record,
            transaction
          }
        );
      });
      promises = promises.concat(updatePromises);
    }
    if (records.delete.length > 0) {
      const deletePromises = records.delete.map(record => {
        return UserRoomMappingModel.update(
          { isActive: false },
          {
            where: record,
            transaction
          }
        );
      });
      promises = promises.concat(deletePromises);
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    transaction.commit();
  } catch (err) {
    throw err;
  }
}

function generateAccessKey() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return "_" + Math.random().toString(36).substr(2, 9);
}

function checkIfUserExistByAccessKey(accessKey) {
  return getModel("User")
    .findOne({
      where: {
        isActive: true,
        accessKey
      },
      raw: true
    })
    .then(userDetails => {
      if (!userDetails) {
        throw new InvalidAccessKey(accessKey);
      }
      return userDetails;
    });
}

async function getUserRooms(accessKey, showInactiveRecords = false) {
  const UserModel = getModel("User");
  const UserRoomMappingModel = getModel("UserRoomMapping");
  const RoomModel = getModel("Room");

  return UserRoomMappingModel.findAll({
    attributes: ["isActive"],
    where: showInactiveRecords === false
      ? {
          isActive: true
        }
      : {},
    include: [
      {
        attributes: [],
        model: UserModel,
        where: {
          isActive: true,
          accessKey
        }
      },
      {
        attributes: ["name", "roomId"],
        model: RoomModel,
        where: {
          isActive: true
        }
      }
    ],
    raw: true
  }).then(rooms => {
    return rooms.map(room => {
      return {
        isActive: room.isActive,
        name: room["Room.name"],
        roomId: room["Room.roomId"]
      };
    });
  });
}

async function addChatMessage(accessKey, { room, message }) {
  // validate user
  const userDetails = await checkIfUserExistByAccessKey(accessKey);

  // validate if user is assigned this room
  const [userRoomDetails] = await checkIfUserIsAssignedRooms(accessKey, [room]);
  const UserChatMessageModel = await getModel("UserChatMessage");
  return UserChatMessageModel.create(
    {
      userId: userDetails.userId,
      roomId: userRoomDetails.roomId,
      message
    },
    { returning: true }
  );
}

async function createSocketSession(socketId, accessKey, rooms = []) {
  try {
    // check if access key is valid
    await checkIfUserExistByAccessKey(accessKey);
    // check if the rooms are mapped to the user
    const userRooms = await checkIfUserIsAssignedRooms(accessKey, rooms);
    // get list of socket sessions for this user if available
    let socketSessions = await redis.getJSON(accessKey);
    socketSessions = socketSessions || [];
    socketSessions.push(socketId);
    // add socket id into the existing list of sessions
    await redis.setJSON(accessKey, socketSessions);
    // get details mapped to socket
    let socketDetails = await redis.getJSON(socketId);
    socketDetails = socketDetails || {};
    socketDetails.accessKey = accessKey;
    socketDetails.rooms = rooms;
    // map socketid with the accessKey, this is used for disconnection
    await redis.setJSON(socketId, socketDetails);
    return { accessKey, userRooms };
  } catch (err) {
    throw err;
  }
}

async function removeSocketSession(socketId) {
  try {
    // get accessKey from socketId
    let { accessKey } = await redis.getJSON(socketId);
    if (accessKey) {
      // get list of available socket sessions for this user using accessKey
      let socketSessions = await redis.getJSON(accessKey);
      if (socketSessions) {
        socketSessions = socketSessions.filter(
          sessionSocketId => sessionSocketId !== socketId
        );
        // remove the socketId and accessKey binding
        redis.del(socketId);
        redis.setJSON(accessKey, socketSessions);
      }
    }
    return { accessKey };
  } catch (err) {
    throw err;
  }
}

async function getUsersAccessKeyBySocketSession(sockets) {
  try {
    const promises = sockets.map(socketId => redis.getJSON(socketId));
    return Promise.all(promises).then(accessKeys => {
      return accessKeys.reduce((acc, socketDetails) => {
        if (socketDetails && socketDetails.accessKey) {
          acc.push(socketDetails.accessKey);
        }
        return acc;
      }, []);
    });
  } catch (err) {}
}

async function checkIfUserIsAssignedRooms(accessKey, rooms) {
  const userRooms = await getUserRooms(accessKey);
  return rooms.reduce((acc, room) => {
    const userRoomDetails = userRooms.find(({ name }) => name === room);
    if (!userRoomDetails) {
      // invalid room name provided or the given room is not mapped to the user
      throw new InvalidUserRoom(room);
    }
    acc.push(userRoomDetails);
    return acc;
  }, []);
}

async function getUserChatRoomHistory(accessKey, room) {
  const userDetails = await checkIfUserExistByAccessKey(accessKey);
  // check if the room is assigned to user
  const userRooms = await getUserRooms(accessKey);
  const roomDetails = userRooms.find(({ name }) => name === room);
  if (!roomDetails) {
    throw new RoomNotAssignedTouser(room);
  }

  return getModel("UserChatMessage")
    .findAll({
      where: {
        isActive: true,
        userId: userDetails.userId,
        roomId: roomDetails.roomId
      },
      include: [
        {
          attributes: ['accessKey'],
          model: getModel('User'),
          where: {
            isActive: true
          }
        }
      ],
      raw: true
    }).then(details => {
      return {
        room,
        messages: details.map(detail => ({
          message: detail.message,
          sentOn: detail.createdAt,
          accessKey: detail['User.accessKey']
        }))
      }
    })
}

module.exports = {
  register,
  createSession,
  assignRooms,
  getUserRooms,
  addChatMessage,
  createSocketSession,
  removeSocketSession,
  getUsersAccessKeyBySocketSession,
  getUserChatRoomHistory
};
