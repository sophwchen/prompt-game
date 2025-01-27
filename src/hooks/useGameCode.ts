import { useParams } from "next/navigation";

export default function useGameCode() {
    const params = useParams();
    const gameCode = params!.gameCode;
    return gameCode;
}
