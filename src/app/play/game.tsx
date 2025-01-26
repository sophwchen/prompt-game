"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const PROMPTS = [
  "Netflix",
  "Keyhole",
  "Sunflower",
  "chicken",
  "Antarctica",
  "Mars",
  "Earth",
  "Alien",
  "Book",
  "Television",
  "Basketball",
  "Piano",
  "Concert",
  "Hiking",
  "Boat",
  "Frisbee",
  "The Grinch",
  "Santa Claus",
  "Michael phelps",
  "Donald trump",
  "Joe Biden",
  "Kamala Harris",
  "Queen Elizabeth",
  "Usain Bolt",
  "Taylor Swift",
  "Tooth Fairy",
];

export default function SoloPlay() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userInput, setUserInput] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * PROMPTS.length);
    return PROMPTS[randomIndex];
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      setIsGameOver(true);
    }

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.toLowerCase().includes(currentPrompt.toLowerCase())) {
      setErrorMessage("You can't use the word from the prompt!");
      return;
    }

    try {
      const response = await fetch("/api/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: "cartoon " + userInput }),
      });

      const data = await response.json();
      console.log("API Response:", data); // Debug log

      if (data.error) {
        setErrorMessage(data.error);
        return;
      }

      if (!data.imageUrl) {
        throw new Error("No image URL received");
      }

      setGeneratedImage(data.imageUrl);
      setIsGameOver(true);
      setImageError(false);
    } catch (error) {
      console.error("Error details:", error);
      setErrorMessage("Failed to generate image. Please try again.");
    }
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setTimeLeft(10);
    setUserInput("");
    setIsGameOver(false);
    setErrorMessage("");
    setGeneratedImage(null);
    setCurrentPrompt(getRandomPrompt());
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

        <main className="py-12">
          {/* Top Bar with Prompt, Timer, and Begin Game */}
          <div className="flex items-center justify-between mb-8">
            {!gameStarted ? (
              <button
                onClick={handleStartGame}
                className="px-8 py-4 bg-white/40 hover:bg-white/50 text-white rounded-xl transition-all duration-200 text-xl font-bold"
              >
                Begin Game
              </button>
            ) : (
              <div className="text-4xl font-bold text-white game-title">
                {currentPrompt}
              </div>
            )}

            {gameStarted && (
              <div className="text-4xl font-bold text-white">
                Time Left: {timeLeft}s
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Player Leaderboard Section */}
            <div className="lg:col-span-1 bg-white/20 backdrop-blur-md rounded-xl p-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Player Leaderboard
              </h2>
              <div className="text-white/50">
                Leaderboard content goes here...
              </div>
            </div>

            {/* Image Display */}
            <div className="lg:col-span-2">
              <div className="aspect-square bg-white/20 backdrop-blur-md rounded-xl overflow-hidden relative">
                {generatedImage && !imageError ? (
                  <Image
                    src={generatedImage}
                    alt="Generated artwork"
                    fill
                    className="object-contain"
                    onError={() => {
                      console.error("Image failed to load");
                      setImageError(true);
                    }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
                      Waiting for prompt...
                    </div>
                  </div>
                )}
              </div>

              {/* User Input Form */}
              {gameStarted && !isGameOver && (
                <div className="mt-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="Enter your clue..."
                    />
                    {errorMessage && (
                      <p className="text-red-400">{errorMessage}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-white/40 hover:bg-white/50 text-white rounded-lg transition-all duration-200"
                    >
                      Submit
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Chat Section */}
            <div className="lg:col-span-1 bg-white/20 backdrop-blur-md rounded-xl p-4">
              <h2 className="text-xl font-bold text-white mb-4">Chat</h2>
              <div className="text-white/50">Chat content goes here...</div>
            </div>
          </div>

          {isGameOver && (
            <div className="text-center mt-8">
              <button
                onClick={handleStartGame}
                className="px-6 py-3 bg-white/40 hover:bg-white/50 text-white rounded-lg transition-all duration-200"
              >
                Play Again
              </button>
              {imageError && (
                <p className="text-red-400 mt-4">
                  Failed to load the generated image
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
