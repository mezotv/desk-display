import { TIC_TAC_TOE_LINES } from "@/constants/tic-tac-toe";
import type {
  TicTacToeCell,
  TicTacToeOutcome,
} from "@/types/tic-tac-toe";

export function getTicTacToeOutcome(
  board: ReadonlyArray<TicTacToeCell>,
): TicTacToeOutcome {
  for (const [first, second, third] of TIC_TAC_TOE_LINES) {
    const mark = board[first];

    if (mark && mark === board[second] && mark === board[third]) {
      return mark;
    }
  }

  return board.every((cell) => cell !== null) ? "draw" : null;
}
