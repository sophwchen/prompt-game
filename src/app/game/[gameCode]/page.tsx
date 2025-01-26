"use client";

import { useSearchParams } from "next/navigation";
import { use } from "react";
import { useGameState } from "@/hooks/useGameState";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function GamePage({
  params,
}: {
  params: Promise<{ gameCode: string }>;
}) {
  const searchParams = useSearchParams();
  const playerName = searchParams.get("player");
  const isHost = searchParams.get("host");
  const { gameCode } = use(params);

  const { gameState, joinGame, createGame } = useGameState(gameCode);

  useEffect(() => {
    const player = {
      id: uuidv4(),
      name: playerName || "Anonymous",
    };

    if (isHost) {
      createGame.mutate(player);
    } else {
      joinGame.mutate(player);
    }
  }, [gameCode, playerName, isHost, joinGame, createGame]);

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
              {gameState?.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center space-x-2 text-white/90"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>
                    {player.name}
                    {gameState.host === player.id && " (Host)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
