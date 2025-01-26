import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GameState, Player } from "../types/game";
import { useSocket } from "./useSocket";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export function useGameState(gameCode: string) {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Query for getting game state
  const {
    data: gameState,
    isLoading,
    isError,
  } = useQuery<GameState>({
    queryKey: ["game", gameCode],
    enabled: !!gameCode && !!socket,
    queryFn: () =>
      new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error("Socket connection not established"));
          return;
        }
        socket.emit("get-game-state", { gameCode });

        const handleGameState = (state: GameState) => {
          resolve(state);
        };

        const handleError = (error: { message: string }) => {
          reject(new Error(error.message));
        };

        socket.once("game-state", handleGameState);
        socket.once("game-error", handleError);

        return () => {
          socket.off("game-state", handleGameState);
          socket.off("game-error", handleError);
        };
      }),
  });

  // Listen for game state updates
  useEffect(() => {
    if (!socket || !gameCode) return;

    const handleGameStateUpdate = (updatedState: GameState) => {
      queryClient.setQueryData(["game", gameCode], updatedState);
    };

    const handleGameError = (error: { message: string }) => {
      setError(error.message);
    };

    socket.on("game-state-updated", handleGameStateUpdate);
    socket.on("game-error", handleGameError);

    return () => {
      socket.off("game-state-updated", handleGameStateUpdate);
      socket.off("game-error", handleGameError);
    };
  }, [socket, gameCode, queryClient]);

  // Create game mutation
  const createGame = useMutation({
    mutationFn: (player: Player) => {
      if (!socket) throw new Error("Socket connection not established");
      return new Promise((resolve, reject) => {
        socket.emit("create-game", { gameCode, player });

        const handleSuccess = (game: GameState) => {
          resolve(game);
        };

        const handleError = (error: { message: string }) => {
          reject(new Error(error.message));
        };

        socket.once("game-created", handleSuccess);
        socket.once("game-error", handleError);
      });
    },
  });

  // Join game mutation
  const joinGame = useMutation({
    mutationFn: (player: Player) => {
      if (!socket) throw new Error("Socket connection not established");
      return new Promise((resolve, reject) => {
        socket.emit("join-game", { gameCode, player });

        const handleSuccess = (game: GameState) => {
          resolve(game);
        };

        const handleError = (error: { message: string }) => {
          reject(new Error(error.message));
        };

        socket.once("game-state-updated", handleSuccess);
        socket.once("game-error", handleError);
      });
    },
  });

  return {
    gameState,
    isLoading,
    isError,
    error,
    createGame,
    joinGame,
  };
}
