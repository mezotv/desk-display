import type { BrickStrength } from "@/types/arcade";
import type { DisplayLanguage } from "@/types/settings";

export const ARCADE_WIDTH = 800;
export const ARCADE_HEIGHT = 360;
export const ARCADE_MAX_DELTA_SECONDS = 0.035;
export const ARCADE_BACKGROUND_COLOR = "#0d0d12";
export const ARCADE_GUIDE_COLOR = "#2c2c36";
export const ARCADE_BALL_COLOR = "#f8fafc";

export const PONG_BALL_SIZE = 14;
export const PONG_BALL_SPEED = 330;
export const PONG_CPU_SPEED = 235;
export const PONG_PADDLE_HEIGHT = 88;
export const PONG_PADDLE_INSET = 28;
export const PONG_PADDLE_WIDTH = 16;
export const PONG_WINNING_SCORE = 5;
export const PONG_PLAYER_COLOR = "#af5cf6";
export const PONG_CPU_COLOR = "#22d3ee";

export const BRICK_BREAKER_BALL_RADIUS = 8;
export const BRICK_BREAKER_BALL_SPEED_X = 215;
export const BRICK_BREAKER_BALL_SPEED_Y = -255;
export const BRICK_BREAKER_BRICK_COLUMNS = 10;
export const BRICK_BREAKER_BRICK_GAP = 7;
export const BRICK_BREAKER_BRICK_HEIGHT = 22;
export const BRICK_BREAKER_BRICK_ROWS = 5;
export const BRICK_BREAKER_BRICK_TOP = 34;
export const BRICK_BREAKER_BRICK_WIDTH = 68;
export const BRICK_BREAKER_INITIAL_LIVES = 3;
export const BRICK_BREAKER_PADDLE_HEIGHT = 14;
export const BRICK_BREAKER_PADDLE_WIDTH = 116;
export const BRICK_BREAKER_PADDLE_Y = 330;
export const BRICK_BREAKER_PADDLE_COLOR = "#22d3ee";
export const BRICK_BREAKER_COLOR_BY_STRENGTH: Record<
  BrickStrength,
  string
> = {
  1: "#60a5fa",
  2: "#af5cf6",
  3: "#f59e0b",
};

export const PONG_COPY = {
  de: {
    display: "DISPLAY",
    displayWon: "DISPLAY GEWINNT",
    firstToFive: "ERSTER BIS 5",
    play: "SPIELEN",
    ready: "ZIEH HOCH ODER RUNTER",
    title: "PONG",
    you: "DU",
    youWon: "DU GEWINNST",
  },
  en: {
    display: "DISPLAY",
    displayWon: "DISPLAY WINS",
    firstToFive: "FIRST TO 5",
    play: "PLAY",
    ready: "DRAG UP OR DOWN",
    title: "PONG",
    you: "YOU",
    youWon: "YOU WIN",
  },
} satisfies Record<DisplayLanguage, Record<string, string>>;

export const BRICK_BREAKER_COPY = {
  de: {
    gameOver: "GAME OVER",
    hint: "ZIEH DEN SCHLÄGER",
    lives: "LEBEN",
    play: "SPIELEN",
    score: "PUNKTE",
    title: "BRICK BREAKER",
    won: "ALLE ZERSTÖRT",
  },
  en: {
    gameOver: "GAME OVER",
    hint: "DRAG THE PADDLE",
    lives: "LIVES",
    play: "PLAY",
    score: "SCORE",
    title: "BRICK BREAKER",
    won: "ALL CLEAR",
  },
} satisfies Record<DisplayLanguage, Record<string, string>>;
