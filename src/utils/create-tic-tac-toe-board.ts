import type { TicTacToeCell } from "@/types/tic-tac-toe";

export function createTicTacToeBoard(): TicTacToeCell[] {
  return Array<TicTacToeCell>(9).fill(null);
}
