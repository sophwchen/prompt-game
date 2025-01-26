import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Player, GameState } from "@/types/game";
import { gameManager } from "@/server/gameManager";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  console.log("Socket handler called");

  if (!res.socket.server.io) {
    console.log("Initializing socket.io server");
    const httpServer: HTTPServer = res.socket.server as any;
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on(
        "create-game",
        ({ gameCode, player }: { gameCode: string; player: Player }) => {
          const newGame: GameState = {
            gameCode,
            players: [{ ...player, score: 0 }],
            status: "waiting",
            host: player.id,
          };

          gameManager.setGame(gameCode, newGame);
          socket.join(gameCode);
          io.to(gameCode).emit("game-state-updated", newGame);
          console.log("Game created:", gameCode);
        }
      );

      socket.on(
        "join-game",
        ({ gameCode, player }: { gameCode: string; player: Player }) => {
          const game = gameManager.getGame(gameCode);

          if (!game) {
            socket.emit("game-error", { message: "Game not found" });
            return;
          }

          game.players.push({ ...player, score: 0 });
          gameManager.setGame(gameCode, game);
          socket.join(gameCode);
          io.to(gameCode).emit("game-state-updated", game);
          console.log("Player joined game:", gameCode);
        }
      );

      socket.on("get-game-state", ({ gameCode }) => {
        console.log("Getting game state for:", gameCode);
        const game = gameManager.getGame(gameCode);
        if (game) {
          socket.join(gameCode);
          socket.emit("game-state-updated", game);
          console.log("Game state sent:", game);
        } else {
          socket.emit("game-error", { message: "Game not found" });
          console.log("Game not found:", gameCode);
        }
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
    console.log("Socket.io server initialized");
  } else {
    console.log("Socket.io server already initialized");
  }
  res.end();
};

export default ioHandler;
