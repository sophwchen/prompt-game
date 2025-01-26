import type { GameState } from "@/types/game";

// Singleton instance to ensure we're using the same instance across the app
let instance: GameManager | null = null;

class GameManager {
  private games: Map<string, GameState> = new Map();

  constructor() {
    if (instance) {
      return instance;
    }
    instance = this;
  }

  getGame(gameCode: string): GameState | undefined {
    return this.games.get(gameCode);
  }

  setGame(gameCode: string, game: GameState): void {
    this.games.set(gameCode, game);
    console.log("Game stored:", gameCode, this.games.has(gameCode));
  }

  removeGame(gameCode: string): void {
    this.games.delete(gameCode);
  }

  getAllGames(): Map<string, GameState> {
    return this.games;
  }
}

// Export a singleton instance
export const gameManager = new GameManager();
