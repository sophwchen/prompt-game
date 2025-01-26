export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface GameState {
  gameCode: string;
  players: Player[];
  status: "waiting" | "playing" | "finished";
  host: string;
}
