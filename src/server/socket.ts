import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { gameManager } from "./gameManager";

interface User {
  _id: string;
  [key: string]: any;
}

let io: SocketIOServer;

const userToSocketMap: { [key: string]: Socket } = {}; // maps user ID to socket object
const socketToUserMap: { [key: string]: User } = {}; // maps socket ID to user object
const socketToGame: Map<string, string> = new Map(); // maps socket ID to game code

const getAllConnectedUsers = (): User[] => Object.values(socketToUserMap);
const getSocketFromUserID = (userid: string): Socket | undefined =>
  userToSocketMap[userid];
const getUserFromSocketID = (socketid: string): User | undefined =>
  socketToUserMap[socketid];
const getSocketFromSocketID = (socketid: string): User | undefined =>
  socketToUserMap[socketid];

const addUser = (user: User, socket: Socket): void => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }
  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
  io.emit("activeUsers", { activeUsers: getAllConnectedUsers() });
};

const removeUser = (user: User | undefined, socket: Socket): void => {
  if (user) {
    delete userToSocketMap[user._id];
  }
  delete socketToUserMap[socket.id];
  io.emit("activeUsers", { activeUsers: getAllConnectedUsers() });
};

export const init = (http: HTTPServer): void => {
  io = new SocketIOServer(http);

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("create-game", ({ gameCode, player }) => {
      try {
        // Register the player as a user
        const user = { _id: player.id, name: player.name };
        addUser(user, socket);

        // Update the player's socket ID now that we have it
        player.socketId = socket.id;

        const game = gameManager.createGame(gameCode, player);
        socket.join(gameCode); // Join the room for this game
        socketToGame.set(socket.id, gameCode);
        socket.emit("game-created", game);
        io.to(gameCode).emit("game-state-updated", game);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create game";
        socket.emit("game-error", { message: errorMessage });
      }
    });

    socket.on("join-game", ({ gameCode, player }) => {
      try {
        // Register the player as a user
        const user = { _id: player.id, name: player.name };
        addUser(user, socket);

        // Update the player's socket ID now that we have it
        player.socketId = socket.id;

        const game = gameManager.joinGame(gameCode, player);
        socket.join(gameCode);
        socketToGame.set(socket.id, gameCode);
        io.to(gameCode).emit("game-state-updated", game);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to join game";
        socket.emit("game-error", { message: errorMessage });
      }
    });

    socket.on("get-game-state", ({ gameCode }) => {
      const game = gameManager.getGame(gameCode);
      if (game) {
        socket.emit("game-state", game);
      } else {
        socket.emit("game-error", { message: "Game not found" });
      }
    });

    socket.on("check-game", ({ gameCode }, callback) => {
      try {
        const exists = gameManager.getGame(gameCode) !== undefined;
        callback({ exists });
      } catch (error) {
        callback({ exists: false });
      }
    });

    socket.on("disconnect", () => {
      const gameCode = socketToGame.get(socket.id);
      const user = getUserFromSocketID(socket.id);

      if (gameCode) {
        try {
          const game = gameManager.removePlayerBySocketId(socket.id);
          if (game) {
            io.to(gameCode).emit("game-state-updated", game);
            if (game.players.length === 0) {
              gameManager.removeGame(gameCode);
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Error handling disconnect";
          console.error(errorMessage);
        }
        socketToGame.delete(socket.id);
      }

      // Remove the user from our maps
      if (user) {
        removeUser(user, socket);
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const getIo = (): SocketIOServer => io;

export {
  addUser,
  removeUser,
  getSocketFromUserID,
  getUserFromSocketID,
  getSocketFromSocketID,
  getAllConnectedUsers,
};
