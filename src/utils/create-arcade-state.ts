import {
  ARCADE_HEIGHT,
  ARCADE_WIDTH,
  BRICK_BREAKER_BALL_SPEED_X,
  BRICK_BREAKER_BALL_SPEED_Y,
  BRICK_BREAKER_BRICK_COLUMNS,
  BRICK_BREAKER_BRICK_GAP,
  BRICK_BREAKER_BRICK_HEIGHT,
  BRICK_BREAKER_BRICK_ROWS,
  BRICK_BREAKER_BRICK_TOP,
  BRICK_BREAKER_BRICK_WIDTH,
  BRICK_BREAKER_INITIAL_LIVES,
  BRICK_BREAKER_PADDLE_WIDTH,
  PONG_BALL_SPEED,
} from "@/constants/arcade";
import type {
  Brick,
  BrickBreakerGameState,
  BrickStrength,
  PongGameState,
} from "@/types/arcade";

export function createPongGameState(): PongGameState {
  return {
    ballX: ARCADE_WIDTH / 2,
    ballY: ARCADE_HEIGHT / 2,
    cpuScore: 0,
    cpuY: ARCADE_HEIGHT / 2,
    lastFrameAt: 0,
    playerScore: 0,
    playerY: ARCADE_HEIGHT / 2,
    status: "ready",
    velocityX: -PONG_BALL_SPEED,
    velocityY: PONG_BALL_SPEED * 0.42,
  };
}

export function createBrickBreakerBricks(): Brick[] {
  const boardWidth =
    BRICK_BREAKER_BRICK_COLUMNS * BRICK_BREAKER_BRICK_WIDTH +
    (BRICK_BREAKER_BRICK_COLUMNS - 1) * BRICK_BREAKER_BRICK_GAP;
  const boardLeft = (ARCADE_WIDTH - boardWidth) / 2;

  return Array.from(
    { length: BRICK_BREAKER_BRICK_ROWS * BRICK_BREAKER_BRICK_COLUMNS },
    (_, index) => {
      const row = Math.floor(index / BRICK_BREAKER_BRICK_COLUMNS);
      const column = index % BRICK_BREAKER_BRICK_COLUMNS;
      const maxHits: BrickStrength = row === 0 ? 3 : row < 3 ? 2 : 1;

      return {
        column,
        hits: maxHits,
        id: `${row}-${column}`,
        maxHits,
        row,
        x:
          boardLeft +
          column * (BRICK_BREAKER_BRICK_WIDTH + BRICK_BREAKER_BRICK_GAP),
        y:
          BRICK_BREAKER_BRICK_TOP +
          row * (BRICK_BREAKER_BRICK_HEIGHT + BRICK_BREAKER_BRICK_GAP),
      };
    },
  );
}

export function createBrickBreakerGameState(): BrickBreakerGameState {
  return {
    ballX: ARCADE_WIDTH / 2,
    ballY: 295,
    bricks: createBrickBreakerBricks(),
    lastFrameAt: 0,
    lives: BRICK_BREAKER_INITIAL_LIVES,
    paddleX: (ARCADE_WIDTH - BRICK_BREAKER_PADDLE_WIDTH) / 2,
    score: 0,
    status: "ready",
    velocityX: BRICK_BREAKER_BALL_SPEED_X,
    velocityY: BRICK_BREAKER_BALL_SPEED_Y,
  };
}
