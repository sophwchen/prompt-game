import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export function useSocket() {
  const socket = useRef<Socket>();
  const queryClient = useQueryClient();

  useEffect(() => {
    const socketInitializer = async () => {
      await fetch("/api/socket");

      socket.current = io({
        path: "/api/socket",
      });

      socket.current.on("connect", () => {
        console.log("Socket connected");
      });

      socket.current.on("game-state-updated", (gameState) => {
        queryClient.setQueryData(["game", gameState.code], gameState);
      });

      socket.current.on("game-error", (error) => {
        console.error("Game error:", error);
      });
    };

    socketInitializer();

    return () => {
      socket.current?.disconnect();
    };
  }, [queryClient]);

  return socket.current;
}
