"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NameInput } from "@/components/NameInput";
import generateGameCode from "@/utils/gameCode";
import { useGameState } from "@/hooks/useGameState";
import { v4 as uuidv4 } from "uuid";

export default function Play() {
  const router = useRouter();
  const [showNameInput, setShowNameInput] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");
  const [currentGameState, setCurrentGameState] = useState<{
    code: string;
    isHost: boolean;
  } | null>(null);

  // Only initialize game state when we have a game code
  const {
    createGame,
    joinGame,
    gameState,
    error: gameError,
  } = useGameState(currentGameState?.code ?? "");

  // Handle game error updates
  useEffect(() => {
    if (gameError) {
      setError(gameError);
      setShowNameInput(false);
      setCurrentGameState(null);
    }
  }, [gameError]);

  const handleCreateGame = () => {
    const newGameCode = generateGameCode();
    setCurrentGameState({ code: newGameCode, isHost: true });
    setIsJoining(false);
    setShowNameInput(true);
    setError(""); // Clear any previous errors
  };

  const handleJoinGame = async () => {
    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    setCurrentGameState({ code: gameCode, isHost: false });
    setIsJoining(true);
    setShowNameInput(true);
    setError(""); // Clear any previous errors
  };

  const handleNameSubmit = async (name: string) => {
    if (!currentGameState) return;

    const playerId = uuidv4();
    const player = {
      id: playerId,
      name: name,
      socketId: "", // This will be set by the server
    };

    try {
      if (currentGameState.isHost) {
        await createGame.mutateAsync(player);
      } else {
        await joinGame.mutateAsync(player);
      }

      // If successful, redirect to the game page
      router.push(
        `/game/${
          currentGameState.code
        }?playerId=${playerId}&playerName=${encodeURIComponent(name)}&isHost=${
          currentGameState.isHost
        }`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game");
      setShowNameInput(false);
      setCurrentGameState(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-6">
          <Link
            href="/"
            className="inline-block text-2xl font-bold text-white game-title wiggle hover:scale-110 transition-transform"
          >
            CLUEGEN
          </Link>
        </nav>

        <main className="min-h-[calc(100vh-88px)] flex items-center justify-center">
          <div className="w-full max-w-md space-y-8 p-8 rounded-2xl bg-white/10 backdrop-blur-md hover:scale-[1.02] transition-transform duration-300">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-3 game-title float">
                Join or Create
              </h2>
              <p className="text-white/90 text-lg">
                Enter a game code or start a new game
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label
                  htmlFor="gameCode"
                  className="block text-white/90 text-lg font-medium"
                >
                  Game Code
                </label>
                <input
                  type="text"
                  id="gameCode"
                  value={gameCode}
                  onChange={(e) => {
                    setGameCode(e.target.value.toUpperCase());
                    setError(""); // Clear error when user types
                  }}
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white text-lg placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 hover:bg-white/10"
                  placeholder="Enter code..."
                />
                {error && (
                  <p className="text-red-400 text-sm animate-fade-in">
                    {error}
                  </p>
                )}
                <button
                  onClick={handleJoinGame}
                  className="w-full mt-2 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 text-lg hover:scale-105"
                >
                  Join Game
                </button>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-transparent text-white/60 text-lg">
                    or
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateGame}
                className="w-full px-6 py-4 bg-white/40 hover:bg-white/50 text-white rounded-lg transition-all duration-200 font-medium border border-white/60 hover:border-white/80 text-lg hover:scale-105 pulse"
              >
                Create New Game
              </button>
            </div>
          </div>
        </main>
      </div>

      {showNameInput && <NameInput onSubmit={handleNameSubmit} />}
    </div>
  );
}
