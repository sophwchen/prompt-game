import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import type { GameState } from "@/types/game";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export function useSocket() {
  const socket = useRef<Socket>();
  const queryClient = useQueryClient();

  useEffect(() => {
    const socketInitializer = async () => {
      console.log("Initializing socket...");
      try {
        await fetch("/api/socket");
        console.log("Socket API endpoint fetched");

        socket.current = io({
          path: "/api/socket",
        });

        socket.current.on("connect", () => {
          console.log("Socket connected with ID:", socket.current?.id);
        });

        socket.current.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });

        socket.current.on("game-state-updated", (gameState: GameState) => {
          console.log("Received game state update:", gameState);
          queryClient.setQueryData(["game", gameState.gameCode], gameState);
        });

        socket.current.on("game-error", (error: { message: string }) => {
          console.error("Game error:", error.message);
        });
      } catch (error) {
        console.error("Socket initialization error:", error);
      }
    };

    socketInitializer();

    return () => {
      console.log("Cleaning up socket connection");
      socket.current?.disconnect();
    };
  }, [queryClient]);

  return socket.current;
}
