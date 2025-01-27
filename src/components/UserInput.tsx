import { useState } from "react";

export default function UserInput() {
	const [userInput, setUserInput] = useState("");
	const [isGameOver, setIsGameOver] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [currentPrompt, setCurrentPrompt] = useState("");
	const [generatedImage, setGeneratedImage] = useState<string | null>(null);
	const [imageError, setImageError] = useState(false);


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

        //


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

	return (
		<div className="mt-8">
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="text"
					value={userInput}
					onChange={(e) => setUserInput(e.target.value)}
					className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
					placeholder="Enter your clue..."
				/>
				{errorMessage && <p className="text-red-400">{errorMessage}</p>}
				<button
					type="submit"
					className="w-full px-6 py-3 bg-white/40 hover:bg-white/50 text-white rounded-lg transition-all duration-200"
				>
					Submit
				</button>
			</form>
		</div>
	);
}
