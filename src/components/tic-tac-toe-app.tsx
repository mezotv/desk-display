import { useState } from "react";

import { TouchAppShell } from "@/components/touch-app-shell";
import {
  INITIAL_TIC_TAC_TOE_SCORE,
  TIC_TAC_TOE_COPY,
} from "@/constants/tic-tac-toe";
import type {
  TicTacToeAppProps,
  TicTacToeOutcome,
} from "@/types/tic-tac-toe";
import { createTicTacToeBoard } from "@/utils/create-tic-tac-toe-board";
import { getTicTacToeMove } from "@/utils/get-tic-tac-toe-move";
import { getTicTacToeOutcome } from "@/utils/get-tic-tac-toe-outcome";

export function TicTacToeApp({ language, onHome }: TicTacToeAppProps) {
  const copy = TIC_TAC_TOE_COPY[language];
  const [board, setBoard] = useState(createTicTacToeBoard);
  const [score, setScore] = useState(INITIAL_TIC_TAC_TOE_SCORE);
  const outcome = getTicTacToeOutcome(board);
  const status =
    outcome === "x"
      ? copy.youWin
      : outcome === "o"
        ? copy.displayWins
        : outcome === "draw"
          ? copy.draw
          : copy.yourMove;

  const updateScore = (nextOutcome: TicTacToeOutcome) => {
    if (!nextOutcome) return;

    setScore((currentScore) => ({
      display: currentScore.display + (nextOutcome === "o" ? 1 : 0),
      draws: currentScore.draws + (nextOutcome === "draw" ? 1 : 0),
      player: currentScore.player + (nextOutcome === "x" ? 1 : 0),
    }));
  };

  const selectCell = (index: number) => {
    if (outcome) {
      setBoard(createTicTacToeBoard());
      return;
    }

    if (board[index] !== null) return;

    const playerBoard = board.map((cell, cellIndex) =>
      cellIndex === index ? "x" : cell,
    );
    const playerOutcome = getTicTacToeOutcome(playerBoard);

    if (playerOutcome) {
      setBoard(playerBoard);
      updateScore(playerOutcome);
      return;
    }

    const displayMove = getTicTacToeMove(playerBoard);
    const nextBoard = playerBoard.map((cell, cellIndex) =>
      cellIndex === displayMove ? "o" : cell,
    );
    const nextOutcome = getTicTacToeOutcome(nextBoard);

    setBoard(nextBoard);
    updateScore(nextOutcome);
  };

  return (
    <TouchAppShell
      accent="#af5cf6"
      icon="/logos/tic-tac-toe-pixel.svg"
      onHome={onHome}
      title={copy.title}
    >
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] place-items-center gap-[clamp(5px,1.2vh,12px)]">
        <div className="text-center">
          <strong
            className={`block text-[clamp(22px,min(3vw,5vh),38px)] font-extrabold tracking-[0.08em] ${
              outcome === "x"
                ? "text-lime-400"
                : outcome === "o"
                  ? "text-red-400"
                  : "text-brand-purple"
            }`}
          >
            {status}
          </strong>
          {outcome && (
            <span className="mt-1 block text-[clamp(11px,min(1.45vw,2.4vh),17px)] font-bold tracking-[0.06em] text-[#666672]">
              {copy.restart}
            </span>
          )}
        </div>

        <div className="grid aspect-square h-full max-h-[min(54vh,360px)] max-w-[min(78vw,360px)] grid-cols-3 grid-rows-3 gap-[clamp(4px,0.8vw,8px)] bg-[#2c2c36] p-[clamp(4px,0.8vw,8px)]">
          {board.map((cell, index) => (
            <button
              aria-label={`Tile ${index + 1}${cell ? `, ${cell.toUpperCase()}` : ""}`}
              className="grid min-h-0 min-w-0 touch-manipulation cursor-pointer place-items-center border-0 bg-display-panel p-0 text-[clamp(50px,min(9vw,15vh),96px)] font-extrabold leading-none outline-none active:scale-[0.94] active:bg-[#1c1c24]"
              key={index}
              onClick={() => selectCell(index)}
              type="button"
            >
              <span
                className={
                  cell === "x" ? "text-brand-purple" : "text-cyan-400"
                }
              >
                {cell?.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        <div className="grid w-[min(88vw,560px)] grid-cols-3 gap-2 text-center">
          <span>
            <strong className="block text-[clamp(20px,min(2.7vw,4.5vh),34px)] text-brand-purple">
              {score.player}
            </strong>
            <span className="text-[clamp(11px,min(1.4vw,2.3vh),16px)] font-bold tracking-[0.08em] text-[#666672]">
              {copy.you}
            </span>
          </span>
          <span>
            <strong className="block text-[clamp(20px,min(2.7vw,4.5vh),34px)] text-[#888894]">
              {score.draws}
            </strong>
            <span className="text-[clamp(11px,min(1.4vw,2.3vh),16px)] font-bold tracking-[0.08em] text-[#666672]">
              {copy.draw}
            </span>
          </span>
          <span>
            <strong className="block text-[clamp(20px,min(2.7vw,4.5vh),34px)] text-cyan-400">
              {score.display}
            </strong>
            <span className="text-[clamp(11px,min(1.4vw,2.3vh),16px)] font-bold tracking-[0.08em] text-[#666672]">
              {copy.display}
            </span>
          </span>
        </div>
      </div>
    </TouchAppShell>
  );
}
