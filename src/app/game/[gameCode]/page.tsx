"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Chat } from "@/components/Chat";
import { ClueInput } from "@/components/ClueInput";
import { ImageDisplay } from "@/components/ImageDisplay";
import useHost from "@/hooks/useHost";
import { db } from "@/lib/firestore";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  onSnapshot,
  arrayUnion,
  updateDoc,
  Unsubscribe,
} from "firebase/firestore";
import useGameCode from "@/hooks/useGameCode";
import { PROMPTS } from "@/utils/prompts";

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  isCorrect?: boolean;
}

export default function SoloPlay() {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
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
  const { isHost } = useHost();
  console.log("isHost", isHost);
  const gameCode = useGameCode();
  const [promptTimeLeft, setPromptTimeLeft] = useState(15);
  const [guessTimeLeft, setGuessTimeLeft] = useState(45);
  const [promptPhase, setPromptPhase] = useState(true);
  const [correctGuesses, setCorrectGuesses] = useState<string[]>([]);

  useEffect(() => {
    let docRef: Unsubscribe;
    async function init() {
      const userId = localStorage.getItem("userId");

      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("code", "==", gameCode as string));
      const querySnapshot = await getDocs(q);
      const gameDoc = querySnapshot.docs[0];

      docRef = onSnapshot(doc(db, "games", gameDoc.id), (doc) => {
        const data = doc.data();
        if (data) {
          setGeneratedImage(data.imageUrl);
          setPromptTimeLeft(data.promptTimeLeft);
          setGuessTimeLeft(data.guessTimeLeft);
          setPromptPhase(data.promptPhase);
          setMessages(data.messages || []);
          setCurrentPrompt(data.prompt);
          setGameStarted(data.gameStarted);
          setIsGameOver(data.isGameOver);
          setCorrectGuesses(data.correctGuesses || []);

          // Find the current user in the users array and set their name
          const currentUser = data.users.find(
            (user: { id: string; name: string }) => user.id === userId
          );
          if (currentUser) {
            setPlayerName(currentUser.name);
          }
        }
      });
      return () => {
        docRef();
      };
    }
    void init();
  }, [gameCode]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsGameOver(true);
    }
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
        body: JSON.stringify({
          prompt: "cartoon " + userInput,
          gameCode: gameCode,
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.error) {
        setErrorMessage(data.error);
        return;
      }

      if (!data.imageUrl) {
        throw new Error("No image URL received");
      }

      // Update the database to switch to guess phase
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("code", "==", gameCode as string));
      const querySnapshot = await getDocs(q);
      const gameDoc = querySnapshot.docs[0];

      await updateDoc(gameDoc.ref, {
        imageUrl: data.imageUrl,
        promptPhase: false, // Set promptPhase to false when image is generated
      });

      setGeneratedImage(data.imageUrl);
      setPromptPhase(false); // Update local state
      startGuessTimer(); // Start the guess timer
      setImageError(false);
    } catch (error) {
      console.error("Error details:", error);
      setErrorMessage("Failed to generate image. Please try again.");
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartGame = async () => {
    clearInterval(timerRef.current!);

    const gamesRef = collection(db, "games");
    const q = query(gamesRef, where("code", "==", gameCode as string));
    const querySnapshot = await getDocs(q);
    const gameDoc = querySnapshot.docs[0];

    await updateDoc(gameDoc.ref, {
      gameStarted: true,
      promptTimeLeft: 15,
      guessTimeLeft: 45,
      promptPhase: true,
      imageUrl: "",
      generatedImage: null,
      prompt: PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
      messages: [],
      isGameOver: false,
      correctGuesses: [],
    });

    setGameStarted(true);
    setUserInput("");
    setIsGameOver(false);
    setErrorMessage("");
    setGeneratedImage(null);
    setPromptPhase(true);
    setPromptTimeLeft(15);
    setGuessTimeLeft(45);

    startPromptTimer();
  };

  const startPromptTimer = () => {
    timerRef.current = setInterval(async () => {
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("code", "==", gameCode as string));
      const querySnapshot = await getDocs(q);
      const gameDoc = querySnapshot.docs[0];

      if (gameDoc.data().promptTimeLeft > 0) {
        await updateDoc(gameDoc.ref, {
          promptTimeLeft: gameDoc.data().promptTimeLeft - 1,
        });
      } else {
        clearInterval(timerRef.current!);
        if (!gameDoc.data().imageUrl) {
          await updateDoc(gameDoc.ref, {
            isGameOver: true,
          });
        } else {
          setPromptPhase(false);
          startGuessTimer();
        }
      }
    }, 1000);
  };

  const startGuessTimer = () => {
    clearInterval(timerRef.current!);
    console.log("Starting guess timer");
    timerRef.current = setInterval(async () => {
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("code", "==", gameCode as string));
      const querySnapshot = await getDocs(q);
      const gameDoc = querySnapshot.docs[0];
      const currentData = gameDoc.data();

      if (currentData.isGameOver) {
        clearInterval(timerRef.current!);
        return;
      }

      if (currentData.guessTimeLeft > 0) {
        await updateDoc(gameDoc.ref, {
          guessTimeLeft: currentData.guessTimeLeft - 1,
          promptPhase: false,
        });
      } else {
        console.log("Guess timer finished");
        clearInterval(timerRef.current!);
        await updateDoc(gameDoc.ref, {
          isGameOver: true,
          promptPhase: false,
        });
      }
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let messageContent = newMessage.trim();
    let isCorrectGuess = false;

    // Check if the message matches the prompt (case insensitive)
    if (
      gameStarted &&
      !isGameOver &&
      messageContent.toLowerCase() === currentPrompt.toLowerCase() &&
      !correctGuesses.includes(playerName)
    ) {
      messageContent = "Correct! 🎉";
      isCorrectGuess = true;

      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("code", "==", gameCode as string));
      const querySnapshot = await getDocs(q);
      const gameDoc = querySnapshot.docs[0];

      await updateDoc(gameDoc.ref, {
        correctGuesses: arrayUnion(playerName),
        isGameOver: true,
      });
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      sender: playerName,
      isCorrect: isCorrectGuess,
    };

    const gamesRef = collection(db, "games");
    const q = query(gamesRef, where("code", "==", gameCode as string));
    const querySnapshot = await getDocs(q);
    const gameDoc = querySnapshot.docs[0];
    await updateDoc(gameDoc.ref, {
      messages: arrayUnion(message),
    });

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

          {/* <BeginGame /> */}
          <div className="flex items-center justify-between mb-8">
            {!gameStarted && isHost && (
              <button
                onClick={handleStartGame}
                className="px-8 py-4 bg-white/40 hover:bg-white/50 text-white rounded-xl transition-all duration-200 text-xl font-bold"
              >
                Begin Game
              </button>
            )}
            {gameStarted && isHost && (
              <div className="text-4xl font-bold text-white game-title">
                {currentPrompt}
              </div>
            )}

            {gameStarted && (
              <div className="text-4xl font-bold text-white">
                {promptPhase
                  ? `Prompt Time: ${promptTimeLeft}s`
                  : `Guess Time: ${guessTimeLeft}s`}
              </div>
            )}
            <div className="text-4xl font-bold text-white">{gameCode}</div>
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
              {gameStarted && !isGameOver && isHost && promptPhase && (
                <ClueInput
                  userInput={userInput}
                  onInputChange={setUserInput}
                  onSubmit={handleSubmit}
                  errorMessage={errorMessage}
                  disabled={generatedImage !== null && generatedImage !== ""}
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
              disabled={isHost}
            />
          </div>

          {isGameOver && (
            <div className="text-center mt-8 space-y-6">
              <div className="text-4xl font-bold text-white game-title">
                The prompt was: {currentPrompt}
              </div>
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
