import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as NetServer } from "net";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!res.socket.server.io) {
    const httpServer: HTTPServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket",
    });

    // Add your socket.io logic here
    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      // Add your existing socket event handlers here
      socket.on("create-game", ({ gameCode, player }) => {
        // Your existing create-game logic
      });

      socket.on("join-game", ({ gameCode, player }) => {
        // Your existing join-game logic
      });

      // ... other socket events
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
