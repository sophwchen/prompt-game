import { useRef } from "react";

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  isCorrect?: boolean;
}

interface ChatProps {
  messages: ChatMessage[];
  newMessage: string;
  playerName: string;
  isGameOver: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  disabled: boolean;
}

export function Chat({
  messages,
  newMessage,
  playerName,
  isGameOver,
  onMessageChange,
  onSendMessage,
  disabled,
}: ChatProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);

  return (
    <div className="lg:col-span-1 bg-white/20 backdrop-blur-md rounded-xl p-4 flex flex-col h-[600px]">
      <h2 className="text-xl font-bold text-white mb-4">Chat</h2>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.sender === playerName ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.isCorrect
                  ? "bg-green-500/30 text-green-300 font-bold"
                  : message.sender === playerName
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              <div className="text-sm font-bold text-white/80">
                {message.sender}
              </div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Form */}
      <form onSubmit={onSendMessage} className="mt-auto">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={
            disabled ? "Hosts cannot participate in chat" : "Type a message..."
          }
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || isGameOver}
        />
      </form>
    </div>
  );
}
