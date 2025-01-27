import { db } from "@/lib/firestore";
import { collection, where, getDocs, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useUserId } from "./useUserId";
import useGameCode from "./useGameCode";

export default function useCheckHost() {
	const [isHost, setIsHost] = useState(false);
	const { userId } = useUserId();

	const gameCode = useGameCode();

    useEffect(() => {
        void checkHost();
    }, []);

	const checkHost = async () => {
		console.log('gameCode',gameCode)	
		console.log('userId',userId)	

        if (!userId || !gameCode) return false;

		try {
			const gamesRef = collection(db, "games");
			const q = query(gamesRef, where("code", "==", gameCode));

			const querySnapshot = await getDocs(q);
			console.log('querySnapshot',querySnapshot)
			if (!querySnapshot.empty) {
				const gameDoc = querySnapshot.docs[0];
				const gameData = gameDoc.data();
				console.log('gameData',gameData)	

				// Check if the current user's ID matches the host ID
				const isUserHost = gameData.host === userId;
				setIsHost(isUserHost);
				return isUserHost;
			}

			return false;
		} catch (error) {
			console.error("Error checking host status:", error);
			return false;
		}
	};

   
	return { isHost, checkHost };
}
