import { useEffect, useRef, useState } from "react";

import { TouchAppShell } from "@/components/touch-app-shell";
import {
  ARCADE_BACKGROUND_COLOR,
  ARCADE_BALL_COLOR,
  ARCADE_HEIGHT,
  ARCADE_MAX_DELTA_SECONDS,
  ARCADE_WIDTH,
  BRICK_BREAKER_BALL_RADIUS,
  BRICK_BREAKER_BALL_SPEED_X,
  BRICK_BREAKER_BALL_SPEED_Y,
  BRICK_BREAKER_BRICK_HEIGHT,
  BRICK_BREAKER_BRICK_WIDTH,
  BRICK_BREAKER_COLOR_BY_STRENGTH,
  BRICK_BREAKER_COPY,
  BRICK_BREAKER_INITIAL_LIVES,
  BRICK_BREAKER_PADDLE_COLOR,
  BRICK_BREAKER_PADDLE_HEIGHT,
  BRICK_BREAKER_PADDLE_WIDTH,
  BRICK_BREAKER_PADDLE_Y,
} from "@/constants/arcade";
import type {
  ArcadeAppProps,
  BrickBreakerGameState,
  BrickBreakerHud,
} from "@/types/arcade";
import { createBrickBreakerGameState } from "@/utils/create-arcade-state";
import { getCanvasPointerPosition } from "@/utils/get-canvas-pointer-position";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function resetBrickBreakerBall(game: BrickBreakerGameState) {
  game.ballX = ARCADE_WIDTH / 2;
  game.ballY = 295;
  game.velocityX =
    BRICK_BREAKER_BALL_SPEED_X * (game.lives % 2 === 0 ? -1 : 1);
  game.velocityY = BRICK_BREAKER_BALL_SPEED_Y;
}

function drawBrickBreaker(
  context: CanvasRenderingContext2D,
  game: BrickBreakerGameState,
) {
  context.fillStyle = ARCADE_BACKGROUND_COLOR;
  context.fillRect(0, 0, ARCADE_WIDTH, ARCADE_HEIGHT);

  for (const brick of game.bricks) {
    context.fillStyle = BRICK_BREAKER_COLOR_BY_STRENGTH[brick.maxHits];
    context.fillRect(
      Math.round(brick.x),
      Math.round(brick.y),
      BRICK_BREAKER_BRICK_WIDTH,
      BRICK_BREAKER_BRICK_HEIGHT,
    );

    context.fillStyle = "rgba(8, 8, 11, 0.72)";
    const pipWidth = 8;
    const pipsWidth = brick.hits * pipWidth + (brick.hits - 1) * 4;
    for (let pip = 0; pip < brick.hits; pip += 1) {
      context.fillRect(
        Math.round(
          brick.x +
            (BRICK_BREAKER_BRICK_WIDTH - pipsWidth) / 2 +
            pip * (pipWidth + 4),
        ),
        Math.round(brick.y + BRICK_BREAKER_BRICK_HEIGHT - 6),
        pipWidth,
        3,
      );
    }
  }

  context.fillStyle = BRICK_BREAKER_PADDLE_COLOR;
  context.fillRect(
    Math.round(game.paddleX),
    BRICK_BREAKER_PADDLE_Y,
    BRICK_BREAKER_PADDLE_WIDTH,
    BRICK_BREAKER_PADDLE_HEIGHT,
  );

  context.fillStyle = ARCADE_BALL_COLOR;
  context.fillRect(
    Math.round(game.ballX - BRICK_BREAKER_BALL_RADIUS),
    Math.round(game.ballY - BRICK_BREAKER_BALL_RADIUS),
    BRICK_BREAKER_BALL_RADIUS * 2,
    BRICK_BREAKER_BALL_RADIUS * 2,
  );
}

function updateBrickBreaker(
  game: BrickBreakerGameState,
  deltaSeconds: number,
) {
  const previousX = game.ballX;
  const previousY = game.ballY;
  game.ballX += game.velocityX * deltaSeconds;
  game.ballY += game.velocityY * deltaSeconds;

  if (
    game.ballX - BRICK_BREAKER_BALL_RADIUS <= 0 &&
    game.velocityX < 0
  ) {
    game.ballX = BRICK_BREAKER_BALL_RADIUS;
    game.velocityX *= -1;
  }
  if (
    game.ballX + BRICK_BREAKER_BALL_RADIUS >= ARCADE_WIDTH &&
    game.velocityX > 0
  ) {
    game.ballX = ARCADE_WIDTH - BRICK_BREAKER_BALL_RADIUS;
    game.velocityX *= -1;
  }
  if (
    game.ballY - BRICK_BREAKER_BALL_RADIUS <= 0 &&
    game.velocityY < 0
  ) {
    game.ballY = BRICK_BREAKER_BALL_RADIUS;
    game.velocityY *= -1;
  }

  const paddleRight = game.paddleX + BRICK_BREAKER_PADDLE_WIDTH;
  if (
    game.velocityY > 0 &&
    game.ballY + BRICK_BREAKER_BALL_RADIUS >= BRICK_BREAKER_PADDLE_Y &&
    previousY + BRICK_BREAKER_BALL_RADIUS <=
      BRICK_BREAKER_PADDLE_Y + BRICK_BREAKER_PADDLE_HEIGHT &&
    game.ballX + BRICK_BREAKER_BALL_RADIUS >= game.paddleX &&
    game.ballX - BRICK_BREAKER_BALL_RADIUS <= paddleRight
  ) {
    const paddleCenter = game.paddleX + BRICK_BREAKER_PADDLE_WIDTH / 2;
    const impact =
      (game.ballX - paddleCenter) / (BRICK_BREAKER_PADDLE_WIDTH / 2);
    game.ballY = BRICK_BREAKER_PADDLE_Y - BRICK_BREAKER_BALL_RADIUS;
    game.velocityY = -Math.max(245, Math.abs(game.velocityY));
    game.velocityX = clamp(game.velocityX + impact * 125, -390, 390);
  }

  const brickIndex = game.bricks.findIndex(
    (brick) =>
      game.ballX + BRICK_BREAKER_BALL_RADIUS >= brick.x &&
      game.ballX - BRICK_BREAKER_BALL_RADIUS <=
        brick.x + BRICK_BREAKER_BRICK_WIDTH &&
      game.ballY + BRICK_BREAKER_BALL_RADIUS >= brick.y &&
      game.ballY - BRICK_BREAKER_BALL_RADIUS <=
        brick.y + BRICK_BREAKER_BRICK_HEIGHT,
  );

  if (brickIndex >= 0) {
    const brick = game.bricks[brickIndex];
    const hitFromTopOrBottom =
      previousY + BRICK_BREAKER_BALL_RADIUS <= brick.y ||
      previousY - BRICK_BREAKER_BALL_RADIUS >=
        brick.y + BRICK_BREAKER_BRICK_HEIGHT;

    if (hitFromTopOrBottom) game.velocityY *= -1;
    else game.velocityX *= -1;

    game.score += 10;
    if (brick.hits === 1) {
      game.bricks.splice(brickIndex, 1);
    } else {
      brick.hits = brick.hits === 3 ? 2 : 1;
    }
  }

  if (game.ballY - BRICK_BREAKER_BALL_RADIUS > ARCADE_HEIGHT) {
    game.lives -= 1;
    if (game.lives <= 0) {
      game.status = "game-over";
    } else {
      game.status = "ready";
      resetBrickBreakerBall(game);
    }
  } else if (game.bricks.length === 0) {
    game.status = "won";
  }
}

export function BrickBreakerApp({ language, onHome }: ArcadeAppProps) {
  const copy = BRICK_BREAKER_COPY[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointerId = useRef<number | null>(null);
  const gameRef = useRef(createBrickBreakerGameState());
  const [hud, setHud] = useState<BrickBreakerHud>(() => ({
    lives: gameRef.current.lives,
    score: gameRef.current.score,
    status: gameRef.current.status,
  }));

  const syncHud = () => {
    const game = gameRef.current;
    setHud({ lives: game.lives, score: game.score, status: game.status });
  };

  const startGame = () => {
    if (
      gameRef.current.status === "game-over" ||
      gameRef.current.status === "won"
    ) {
      gameRef.current = createBrickBreakerGameState();
    }

    gameRef.current.status = "playing";
    gameRef.current.lastFrameAt = 0;
    syncHud();
  };

  const movePaddle = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getCanvasPointerPosition(
      event.currentTarget,
      event.clientX,
      event.clientY,
    );
    gameRef.current.paddleX = clamp(
      point.x - BRICK_BREAKER_PADDLE_WIDTH / 2,
      0,
      ARCADE_WIDTH - BRICK_BREAKER_PADDLE_WIDTH,
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;

    drawBrickBreaker(context, gameRef.current);
    if (hud.status !== "playing") return;

    let frameId = 0;
    const render = (frameAt: number) => {
      const game = gameRef.current;
      const deltaSeconds = game.lastFrameAt
        ? Math.min(
            (frameAt - game.lastFrameAt) / 1_000,
            ARCADE_MAX_DELTA_SECONDS,
          )
        : 0;
      game.lastFrameAt = frameAt;

      const previousLives = game.lives;
      const previousScore = game.score;
      const previousStatus = game.status;
      updateBrickBreaker(game, deltaSeconds);

      if (
        game.lives !== previousLives ||
        game.score !== previousScore ||
        game.status !== previousStatus
      ) {
        syncHud();
      }

      drawBrickBreaker(context, game);
      if (game.status === "playing") {
        frameId = window.requestAnimationFrame(render);
      }
    };

    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, [hud.status]);

  const statusLabel =
    hud.status === "game-over"
      ? copy.gameOver
      : hud.status === "won"
        ? copy.won
        : copy.hint;

  return (
    <TouchAppShell
      accent="#f59e0b"
      icon="/logos/brick-breaker-pixel.svg"
      onHome={onHome}
      title={copy.title}
    >
      <div className="relative h-full min-h-0 overflow-hidden rounded-[14px] border border-[#25252e] bg-[#0d0d12]">
        <canvas
          className="block h-full w-full touch-none"
          height={ARCADE_HEIGHT}
          onPointerCancel={(event) => {
            if (activePointerId.current === event.pointerId) {
              activePointerId.current = null;
            }
          }}
          onPointerDown={(event) => {
            if (hud.status !== "playing") return;
            activePointerId.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            movePaddle(event);
          }}
          onPointerMove={(event) => {
            if (activePointerId.current !== event.pointerId) return;
            movePaddle(event);
          }}
          onPointerUp={(event) => {
            if (activePointerId.current !== event.pointerId) return;
            activePointerId.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          }}
          ref={canvasRef}
          width={ARCADE_WIDTH}
        />

        <div className="pointer-events-none absolute inset-x-3 top-2 flex items-center justify-between text-[clamp(13px,min(1.6vw,2.6vh),19px)] font-bold tracking-[0.08em] text-[#777784]">
          <span>
            {copy.score} <strong className="text-display-text">{hud.score}</strong>
          </span>
          <span>
            {copy.lives}{" "}
            <strong className="text-amber-400">
              {"■".repeat(Math.max(0, hud.lives))}
            </strong>
          </span>
        </div>

        {hud.status !== "playing" ? (
          <button
            className="absolute inset-0 grid touch-manipulation place-content-center gap-3 border-0 bg-black/55 text-center text-display-text outline-none"
            onClick={startGame}
            type="button"
          >
            <strong className="text-[clamp(28px,min(4vw,6.6vh),48px)] font-extrabold tracking-[0.06em] text-amber-400">
              {statusLabel}
            </strong>
            <span className="mx-auto rounded-[10px] bg-amber-400 px-7 py-3 text-[clamp(18px,min(2.3vw,3.8vh),28px)] font-extrabold text-display-bg">
              {copy.play}
            </span>
          </button>
        ) : null}
      </div>
    </TouchAppShell>
  );
}
