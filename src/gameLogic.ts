interface GameState {
  winner: string[];
  players: { [key: string]: number | undefined };
}

const gameState: GameState = {
  winner: [],
  players: {},
};

const updateGameState = () => {};

const spawnPlayer = (id: string) => {
  gameState.players[id] = 0;
};

const removePlayer = (id: string) => {
  if (gameState.players[id] != undefined) {
    gameState.players[id] = undefined;
  }
};

module.exports = {
  spawnPlayer,
  removePlayer,
  gameState,
  updateGameState,
};
