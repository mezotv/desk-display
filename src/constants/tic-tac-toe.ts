import type { DisplayLanguage } from "@/types/settings";
import type {
  TicTacToeCopy,
  TicTacToeLine,
  TicTacToeScore,
} from "@/types/tic-tac-toe";

export const TIC_TAC_TOE_LINES: ReadonlyArray<TicTacToeLine> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const TIC_TAC_TOE_MOVE_PRIORITY: ReadonlyArray<number> = [
  4, 0, 2, 6, 8, 1, 3, 5, 7,
];

export const INITIAL_TIC_TAC_TOE_SCORE: TicTacToeScore = {
  display: 0,
  draws: 0,
  player: 0,
};

export const TIC_TAC_TOE_COPY: Record<DisplayLanguage, TicTacToeCopy> = {
  de: {
    display: "DISPLAY",
    displayWins: "DISPLAY GEWINNT",
    draw: "UNENTSCHIEDEN",
    restart: "FELD ANTIPPEN FÜR NEUE RUNDE",
    title: "TIC TAC TOE",
    you: "DU",
    yourMove: "DU BIST DRAN",
    youWin: "DU GEWINNST",
  },
  en: {
    display: "DISPLAY",
    displayWins: "DISPLAY WINS",
    draw: "DRAW",
    restart: "TAP A TILE FOR A NEW ROUND",
    title: "TIC TAC TOE",
    you: "YOU",
    yourMove: "YOUR MOVE",
    youWin: "YOU WIN",
  },
};
