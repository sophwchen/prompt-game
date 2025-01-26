"use client";

import { useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import type { GameState } from "@/types/game";

export default function GamePage({ params }: { params: { gameCode: string } }) {
  const gameCode = params.gameCode;
  const searchParams = useSearchParams();
  const playerName = searchParams?.get("playerName") ?? "Unknown Player";
  const playerId = searchParams?.get("playerId") ?? "";
  const isHost = searchParams?.get("isHost") === "true";
  const socket = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (!socket || !gameCode) {
      console.log("Socket or gameCode not available", { socket, gameCode });
      return;
    }

    console.log("Setting up socket listeners for game:", gameCode);

    socket.on("game-state-updated", (updatedState: GameState) => {
      console.log("Received game state:", updatedState);
      setGameState(updatedState);
    });

    socket.on("game-error", (error: { message: string }) => {
      console.error("Game error:", error.message);
    });

    console.log("Requesting initial game state");
    socket.emit("get-game-state", { gameCode });

    return () => {
      console.log("Cleaning up socket listeners");
      socket.off("game-state-updated");
      socket.off("game-error");
    };
  }, [socket, gameCode]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="py-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Game Room: {gameCode}
          </h1>
          <p className="text-white/90 mb-8">
            Welcome, {playerName}! {isHost ? "(Host)" : "(Player)"}
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Players</h2>
            <div className="space-y-2">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between text-white/90 p-2 rounded-lg hover:bg-white/5"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span>
                      {player.name}
                      {gameState.host === player.id && " (Host)"}
                    </span>
                  </div>
                  <div>Score: {player.score}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
