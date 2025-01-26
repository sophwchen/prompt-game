export interface Player {
  id: string;
  name: string;
}

export interface GameState {
  gameCode: string;
  players: Player[];
  status: "waiting" | "playing" | "finished";
  host?: string;
}
