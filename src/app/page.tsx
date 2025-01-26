"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStartPlaying = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/play");
    }, 500);
  };

  return (
    <div className={`min-h-screen ${isTransitioning ? "zoom-out" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white game-title wiggle">
              CLUEGEN
            </h1>
            <button className="text-white hover:text-white/80 transition-colors font-medium text-xl">
              How to Play
            </button>
          </div>
        </nav>

        <main className="py-24 sm:py-40">
          <div className="text-center space-y-12">
            <h1 className="text-6xl sm:text-8xl font-bold text-white game-title">
              Clue the AI,
              <br />
              guess the prompt
            </h1>

            <p className="text-2xl text-white/90 max-w-3xl mx-auto">
              Challenge your ability to prompt the AI and guess the outputs.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <button
                onClick={handleStartPlaying}
                className="group relative px-12 py-6 bg-white text-black rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-200 pulse text-2xl"
              >
                Play!
                <div className="absolute inset-0 rounded-xl bg-white/10 blur-xl group-hover:blur-2xl transition-all duration-200 -z-10"></div>
              </button>

              <button className="px-12 py-6 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 text-2xl">
                How to Play
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
