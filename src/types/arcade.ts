import type { DisplayLanguage } from "@/types/settings";

export type ArcadeAppProps = {
  language: DisplayLanguage;
  onHome: () => void;
};

export type ArcadePoint = {
  x: number;
  y: number;
};

export type PongStatus = "display-won" | "playing" | "ready" | "you-won";

export type PongGameState = {
  ballX: number;
  ballY: number;
  cpuScore: number;
  cpuY: number;
  lastFrameAt: number;
  playerScore: number;
  playerY: number;
  status: PongStatus;
  velocityX: number;
  velocityY: number;
};

export type PongHud = Pick<
  PongGameState,
  "cpuScore" | "playerScore" | "status"
>;

export type BrickStrength = 1 | 2 | 3;

export type Brick = {
  column: number;
  hits: BrickStrength;
  id: string;
  maxHits: BrickStrength;
  row: number;
  x: number;
  y: number;
};

export type BrickBreakerStatus =
  | "game-over"
  | "playing"
  | "ready"
  | "won";

export type BrickBreakerGameState = {
  ballX: number;
  ballY: number;
  bricks: Brick[];
  lastFrameAt: number;
  lives: number;
  paddleX: number;
  score: number;
  status: BrickBreakerStatus;
  velocityX: number;
  velocityY: number;
};

export type BrickBreakerHud = Pick<
  BrickBreakerGameState,
  "lives" | "score" | "status"
>;
