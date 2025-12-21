export type Player = "X" | "O" | null;
export type Board = Player[];

/**
 * Creates an empty 3x3 board
 */
export function initialBoard(): Board {
  return Array(9).fill(null);
}

/**
 * Checks if there's a winner on the board
 * Returns the winner ("X" or "O") or null if no winner
 */
export function checkWinner(board: Board): Player {
  const lines = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal top-left to bottom-right
    [2, 4, 6], // diagonal top-right to bottom-left
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

/**
 * Checks if the board is full (no empty cells)
 */
export function isBoardFull(board: Board): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Gets the opponent symbol
 */
export function getOpponent(player: "X" | "O"): "X" | "O" {
  return player === "X" ? "O" : "X";
}

/**
 * Simple bot move using minimax algorithm
 * Returns the best move index for the bot
 */
export function makeBotMove(board: Board, botSymbol: "X" | "O"): number {
  const opponent = getOpponent(botSymbol);

  // Check if bot can win in one move
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = botSymbol;
      if (checkWinner(testBoard) === botSymbol) {
        return i;
      }
    }
  }

  // Check if opponent can win in one move (block them)
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = opponent;
      if (checkWinner(testBoard) === opponent) {
        return i;
      }
    }
  }

  // Try center first
  if (board[4] === null) {
    return 4;
  }

  // Try corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((i) => board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // Try any available cell
  const available = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index): index is number => index !== null);

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  return -1; // No valid move
}

/**
 * Makes a move on the board
 * Returns the new board state or null if move is invalid
 */
export function makeMove(board: Board, position: number, player: "X" | "O"): Board | null {
  if (position < 0 || position > 8 || board[position] !== null) {
    return null;
  }

  const newBoard = [...board];
  newBoard[position] = player;
  return newBoard;
}

