"use client";

import { useState } from "react";

interface NameInputProps {
  onSubmit: (name: string) => void;
}

export function NameInput({ onSubmit }: NameInputProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-6 rounded-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Enter Your Name</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
          placeholder="Your name..."
          autoFocus
        />
        <button
          type="submit"
          className="w-full mt-4 px-6 py-3 bg-white/40 hover:bg-white/50 text-white rounded-lg transition-all duration-200"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
