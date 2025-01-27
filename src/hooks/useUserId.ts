'use client'
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export const useUserId = () => {
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		// Get or create userId in localStorage
		const storedUserId = localStorage.getItem("userId");
		console.log('storedUserId',storedUserId)	
		if (storedUserId) {
			setUserId(storedUserId);
		} else {
			const newUserId = uuidv4();
			localStorage.setItem("userId", newUserId);
			setUserId(newUserId);
		}
	}, []);

	return {
		userId,
	};
};
