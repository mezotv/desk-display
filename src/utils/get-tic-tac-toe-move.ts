import { TIC_TAC_TOE_MOVE_PRIORITY } from "@/constants/tic-tac-toe";
import type {
  TicTacToeCell,
  TicTacToeMark,
} from "@/types/tic-tac-toe";
import { getTicTacToeOutcome } from "@/utils/get-tic-tac-toe-outcome";

function findCompletingMove(
  board: ReadonlyArray<TicTacToeCell>,
  mark: TicTacToeMark,
) {
  return TIC_TAC_TOE_MOVE_PRIORITY.find((index) => {
    if (board[index] !== null) return false;

    const candidate = board.map((cell, cellIndex) =>
      cellIndex === index ? mark : cell,
    );
    return getTicTacToeOutcome(candidate) === mark;
  });
}

export function getTicTacToeMove(board: ReadonlyArray<TicTacToeCell>) {
  return (
    findCompletingMove(board, "o") ??
    findCompletingMove(board, "x") ??
    TIC_TAC_TOE_MOVE_PRIORITY.find((index) => board[index] === null)
  );
}
