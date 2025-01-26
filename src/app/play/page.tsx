"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Chat } from "@/components/Chat";
import { ClueInput } from "@/components/ClueInput";
import { ImageDisplay } from "@/components/ImageDisplay";

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

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  isCorrect?: boolean;
}

export default function SoloPlay() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userInput, setUserInput] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [playerName, setPlayerName] = useState("Player");

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let messageContent = newMessage.trim();
    let isCorrectGuess = false;

    // Check if the message matches the prompt (case insensitive)
    if (
      gameStarted &&
      !isGameOver &&
      messageContent.toLowerCase() === currentPrompt.toLowerCase()
    ) {
      messageContent = "Correct! 🎉";
      isCorrectGuess = true;
      setIsGameOver(true);
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      sender: playerName,
      isCorrect: isCorrectGuess,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Display and Input Section */}
            <div className="lg:col-span-2">
              <ImageDisplay
                generatedImage={generatedImage}
                imageError={imageError}
                onImageError={() => {
                  console.error("Image failed to load");
                  setImageError(true);
                }}
              />

              {/* User Input Form */}
              {gameStarted && !isGameOver && (
                <ClueInput
                  userInput={userInput}
                  onInputChange={setUserInput}
                  onSubmit={handleSubmit}
                  errorMessage={errorMessage}
                />
              )}
            </div>

            {/* Chat Section */}
            <Chat
              messages={messages}
              newMessage={newMessage}
              playerName={playerName}
              isGameOver={isGameOver}
              onMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
            />
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
