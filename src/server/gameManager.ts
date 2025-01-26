interface Player {
  id: string;
  name: string;
  socketId: string;
}

interface Game {
  code: string;
  host: string;
  players: Player[];
  createdAt: number;
}

class GameManager {
  private games: Map<string, Game> = new Map();
  private socketToPlayer: Map<string, { gameCode: string; playerId: string }> =
    new Map();

  createGame(code: string, player: Player): Game {
    if (this.games.has(code)) {
      throw new Error("Game code already exists");
    }

    const game: Game = {
      code,
      host: player.id,
      players: [player],
      createdAt: Date.now(),
    };

    this.games.set(code, game);
    this.socketToPlayer.set(player.socketId, {
      gameCode: code,
      playerId: player.id,
    });
    return game;
  }

  joinGame(code: string, player: Player): Game {
    const game = this.games.get(code);
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.players.find((p) => p.id === player.id)) {
      throw new Error("Player already in game");
    }

    if (game.players.find((p) => p.name === player.name)) {
      throw new Error("Player name already taken");
    }

    game.players.push(player);
    this.socketToPlayer.set(player.socketId, {
      gameCode: code,
      playerId: player.id,
    });
    return game;
  }

  getGame(code: string): Game | undefined {
    return this.games.get(code);
  }

  removePlayerBySocketId(socketId: string): Game | undefined {
    const playerInfo = this.socketToPlayer.get(socketId);
    if (!playerInfo) return undefined;

    const { gameCode, playerId } = playerInfo;
    const game = this.games.get(gameCode);
    if (!game) return undefined;

    game.players = game.players.filter((p) => p.id !== playerId);
    this.socketToPlayer.delete(socketId);

    if (game.players.length > 0 && game.host === playerId) {
      game.host = game.players[0].id;
    }

    this.games.set(gameCode, game);
    return game;
  }

  removeGame(code: string): void {
    const game = this.games.get(code);
    if (!game) return;

    // Clean up all socket associations for this game
    game.players.forEach((player) => {
      for (const [socketId, info] of this.socketToPlayer.entries()) {
        if (info.gameCode === code) {
          this.socketToPlayer.delete(socketId);
        }
      }
    });

    this.games.delete(code);
  }

  isCodeAvailable(code: string): boolean {
    return !this.games.has(code);
  }
}

export const gameManager = new GameManager();
