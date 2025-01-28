interface ClueInputProps {
  userInput: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  errorMessage?: string;
  disabled?: boolean;
}

export function ClueInput({
  userInput,
  onInputChange,
  onSubmit,
  errorMessage,
  disabled,
}: ClueInputProps) {
  return (
    <div className="mt-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Enter your clue..."
          disabled={disabled}
        />
        {errorMessage && <p className="text-red-400">{errorMessage}</p>}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-white/40 hover:bg-white/50 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
