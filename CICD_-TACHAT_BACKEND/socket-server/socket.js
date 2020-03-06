const UserController = require("./modules/user/controller");

function handleSocketConnection(io) {
  io.on("connection", socket => {
    console.log("connected");
    // user connected
    socket.on("initialize", async details => {
      try {
        const {
          accessKey,
          userRooms = []
        } = await UserController.createSocketSession(socket.id, details);
        // join rooms for this socket
        userRooms.map(({ name }) => {
          socket.join(name);
          io.to(name).emit("newUserJoined", {
            room: name,
            accessKey
          });
          // get list of participants in a room
          io.in(name).clients(async (err, clients) => {
            const users = await UserController.getUsersAccessKeyBySocketSession(
              clients
            );
            io.to(name).emit("roomParticipants", {
              room: name,
              participants: users
            });
          });
        });
        if (details.broadcaseMyPresenceToRooms) {
          details.broadcaseMyPresenceToRooms.map(room => {
            io.to(room).emit("newUserJoined", {
              room,
              accessKey
            });
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
    socket.on("message", async details => {
      try {
        const { accessKey } = await UserController.addChatMessage(
          socket.id,
          details
        );
        // send message in a room
        io.to(details.room).emit("message", {
          accessKey,
          message: details.message
        });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("getUserChatRoomHistory", async details => {
      try {
        const userChatHistory = await UserController.getUserChatRoomHistory(
          details
        );
        socket.emit("userChatHistory", userChatHistory);
      } catch (err) {
        console.log(err);
      }
    });
    socket.on("disconnect", async _ => {
      try {
        const {
          accessKey,
          userRooms
        } = await UserController.removeSocketSession(socket.id);
        userRooms.map(({ name }) => {
          io.to(name).emit("userOffline", {
            accessKey,
            room: name
          });
        });
      } catch (err) {}
    });
  });
}

module.exports = handleSocketConnection;
