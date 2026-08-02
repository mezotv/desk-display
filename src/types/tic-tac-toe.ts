import type { DisplayLanguage } from "@/types/settings";

export type TicTacToeMark = "x" | "o";
export type TicTacToeCell = TicTacToeMark | null;
export type TicTacToeOutcome = TicTacToeMark | "draw" | null;
export type TicTacToeLine = readonly [number, number, number];

export type TicTacToeScore = {
  display: number;
  draws: number;
  player: number;
};

export type TicTacToeCopy = {
  display: string;
  displayWins: string;
  draw: string;
  restart: string;
  title: string;
  you: string;
  yourMove: string;
  youWin: string;
};

export type TicTacToeAppProps = {
  language: DisplayLanguage;
  onHome: () => void;
};
