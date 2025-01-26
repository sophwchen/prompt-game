"use client";

import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

export default function GameChat({ playerName }: { playerName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch of messages
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages));

    // Listen for new messages via socket
    socket?.on("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket?.off("new-message");
    };
  }, [socket]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Emit the message through socket
    socket?.emit("chat-message", {
      sender: playerName,
      content: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[500px] bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.sender === playerName ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === playerName
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              <div className="font-bold text-sm">{message.sender}</div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-white/10"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
