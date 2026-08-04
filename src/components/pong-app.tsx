import { useEffect, useRef, useState } from "react";

import { TouchAppShell } from "@/components/touch-app-shell";
import { PixelIcon } from "@/components/pixel-icon";
import {
  ARCADE_BACKGROUND_COLOR,
  ARCADE_BALL_COLOR,
  ARCADE_GUIDE_COLOR,
  ARCADE_HEIGHT,
  ARCADE_MAX_DELTA_SECONDS,
  ARCADE_WIDTH,
  PONG_BALL_SIZE,
  PONG_BALL_SPEED,
  PONG_COPY,
  PONG_CPU_COLOR,
  PONG_CPU_SPEED,
  PONG_PADDLE_HEIGHT,
  PONG_PADDLE_INSET,
  PONG_PADDLE_WIDTH,
  PONG_PLAYER_COLOR,
  PONG_WINNING_SCORE,
} from "@/constants/arcade";
import type { ArcadeAppProps, PongGameState, PongHud } from "@/types/arcade";
import { createPongGameState } from "@/utils/create-arcade-state";
import { getCanvasPointerPosition } from "@/utils/get-canvas-pointer-position";

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function resetPongBall(game: PongGameState, direction: -1 | 1) {
  game.ballX = ARCADE_WIDTH / 2;
  game.ballY = ARCADE_HEIGHT / 2;
  game.velocityX = PONG_BALL_SPEED * direction;
  game.velocityY =
    PONG_BALL_SPEED * (game.playerScore % 2 === 0 ? 0.42 : -0.42);
}

function drawPong(context: CanvasRenderingContext2D, game: PongGameState) {
  context.fillStyle = ARCADE_BACKGROUND_COLOR;
  context.fillRect(0, 0, ARCADE_WIDTH, ARCADE_HEIGHT);

  context.fillStyle = ARCADE_GUIDE_COLOR;
  for (let y = 10; y < ARCADE_HEIGHT; y += 28) {
    context.fillRect(ARCADE_WIDTH / 2 - 2, y, 4, 14);
  }

  context.fillStyle = PONG_PLAYER_COLOR;
  context.fillRect(
    PONG_PADDLE_INSET,
    game.playerY - PONG_PADDLE_HEIGHT / 2,
    PONG_PADDLE_WIDTH,
    PONG_PADDLE_HEIGHT,
  );

  context.fillStyle = PONG_CPU_COLOR;
  context.fillRect(
    ARCADE_WIDTH - PONG_PADDLE_INSET - PONG_PADDLE_WIDTH,
    game.cpuY - PONG_PADDLE_HEIGHT / 2,
    PONG_PADDLE_WIDTH,
    PONG_PADDLE_HEIGHT,
  );

  context.fillStyle = ARCADE_BALL_COLOR;
  context.fillRect(
    Math.round(game.ballX - PONG_BALL_SIZE / 2),
    Math.round(game.ballY - PONG_BALL_SIZE / 2),
    PONG_BALL_SIZE,
    PONG_BALL_SIZE,
  );
}

function updatePong(game: PongGameState, deltaSeconds: number) {
  const cpuOffset = game.ballY - game.cpuY;
  game.cpuY = clamp(
    game.cpuY +
      clamp(
        cpuOffset,
        -PONG_CPU_SPEED * deltaSeconds,
        PONG_CPU_SPEED * deltaSeconds,
      ),
    PONG_PADDLE_HEIGHT / 2,
    ARCADE_HEIGHT - PONG_PADDLE_HEIGHT / 2,
  );

  game.ballX += game.velocityX * deltaSeconds;
  game.ballY += game.velocityY * deltaSeconds;

  const halfBall = PONG_BALL_SIZE / 2;
  if (game.ballY - halfBall <= 0 && game.velocityY < 0) {
    game.ballY = halfBall;
    game.velocityY *= -1;
  }
  if (game.ballY + halfBall >= ARCADE_HEIGHT && game.velocityY > 0) {
    game.ballY = ARCADE_HEIGHT - halfBall;
    game.velocityY *= -1;
  }

  const playerTop = game.playerY - PONG_PADDLE_HEIGHT / 2;
  const playerBottom = game.playerY + PONG_PADDLE_HEIGHT / 2;
  const playerEdge = PONG_PADDLE_INSET + PONG_PADDLE_WIDTH;
  if (
    game.velocityX < 0 &&
    game.ballX - halfBall <= playerEdge &&
    game.ballX + halfBall >= PONG_PADDLE_INSET &&
    game.ballY + halfBall >= playerTop &&
    game.ballY - halfBall <= playerBottom
  ) {
    const impact = (game.ballY - game.playerY) / (PONG_PADDLE_HEIGHT / 2);
    game.ballX = playerEdge + halfBall;
    game.velocityX = Math.min(520, Math.abs(game.velocityX) * 1.035);
    game.velocityY = clamp(game.velocityY + impact * 150, -440, 440);
  }

  const cpuLeft = ARCADE_WIDTH - PONG_PADDLE_INSET - PONG_PADDLE_WIDTH;
  const cpuTop = game.cpuY - PONG_PADDLE_HEIGHT / 2;
  const cpuBottom = game.cpuY + PONG_PADDLE_HEIGHT / 2;
  if (
    game.velocityX > 0 &&
    game.ballX + halfBall >= cpuLeft &&
    game.ballX - halfBall <= cpuLeft + PONG_PADDLE_WIDTH &&
    game.ballY + halfBall >= cpuTop &&
    game.ballY - halfBall <= cpuBottom
  ) {
    const impact = (game.ballY - game.cpuY) / (PONG_PADDLE_HEIGHT / 2);
    game.ballX = cpuLeft - halfBall;
    game.velocityX = -Math.min(520, Math.abs(game.velocityX) * 1.035);
    game.velocityY = clamp(game.velocityY + impact * 130, -440, 440);
  }
}

export function PongApp({ language, onHome }: ArcadeAppProps) {
  const copy = PONG_COPY[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointerId = useRef<number | null>(null);
  const gameRef = useRef(createPongGameState());
  const [hud, setHud] = useState<PongHud>(() => ({
    cpuScore: gameRef.current.cpuScore,
    playerScore: gameRef.current.playerScore,
    status: gameRef.current.status,
  }));

  const syncHud = () => {
    const game = gameRef.current;
    setHud({
      cpuScore: game.cpuScore,
      playerScore: game.playerScore,
      status: game.status,
    });
  };

  const startGame = () => {
    if (gameRef.current.status.endsWith("-won")) {
      gameRef.current = createPongGameState();
    }

    gameRef.current.status = "playing";
    gameRef.current.lastFrameAt = 0;
    syncHud();
  };

  const movePlayer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getCanvasPointerPosition(
      event.currentTarget,
      event.clientX,
      event.clientY,
    );
    gameRef.current.playerY = clamp(
      point.y,
      PONG_PADDLE_HEIGHT / 2,
      ARCADE_HEIGHT - PONG_PADDLE_HEIGHT / 2,
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context) return;

    drawPong(context, gameRef.current);
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

      updatePong(game, deltaSeconds);

      if (game.ballX < -PONG_BALL_SIZE) {
        game.cpuScore += 1;
        if (game.cpuScore >= PONG_WINNING_SCORE) {
          game.status = "display-won";
        } else {
          resetPongBall(game, -1);
        }
        syncHud();
      } else if (game.ballX > ARCADE_WIDTH + PONG_BALL_SIZE) {
        game.playerScore += 1;
        if (game.playerScore >= PONG_WINNING_SCORE) {
          game.status = "you-won";
        } else {
          resetPongBall(game, 1);
        }
        syncHud();
      }

      drawPong(context, game);
      if (game.status === "playing") {
        frameId = window.requestAnimationFrame(render);
      }
    };

    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, [hud.status]);

  const statusLabel =
    hud.status === "you-won"
      ? copy.youWon
      : hud.status === "display-won"
        ? copy.displayWon
        : copy.ready;

  return (
    <TouchAppShell
      accent={PONG_PLAYER_COLOR}
      icon="/logos/pong-pixel.svg"
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
            movePlayer(event);
          }}
          onPointerMove={(event) => {
            if (activePointerId.current !== event.pointerId) return;
            movePlayer(event);
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

        <div className="pointer-events-none absolute inset-x-0 top-2.5 flex items-start justify-center gap-5 text-center">
          <span className="min-w-16 text-right">
            <strong className="block text-[clamp(30px,min(4vw,6.6vh),52px)] leading-none text-brand-purple">
              {hud.playerScore}
            </strong>
            <small className="font-bold tracking-[0.08em] text-[#777784]">
              {copy.you}
            </small>
          </span>
          <span className="mt-1 text-[clamp(16px,min(2vw,3.3vh),24px)] font-bold text-[#4f4f59]">
            {copy.firstToFive}
          </span>
          <span className="min-w-16 text-left">
            <strong className="block text-[clamp(30px,min(4vw,6.6vh),52px)] leading-none text-cyan-400">
              {hud.cpuScore}
            </strong>
            <small className="font-bold tracking-[0.08em] text-[#777784]">
              {copy.display}
            </small>
          </span>
        </div>

        {hud.status !== "playing" ? (
          <button
            className="absolute inset-0 grid touch-manipulation place-content-center gap-3 border-0 bg-black/55 text-center text-display-text outline-none"
            onClick={startGame}
            type="button"
          >
            <strong className="text-[clamp(28px,min(4vw,6.6vh),48px)] font-extrabold tracking-[0.06em] text-brand-purple">
              {statusLabel}
            </strong>
            <span className="mx-auto rounded-[10px] bg-brand-purple px-7 py-3 text-[clamp(18px,min(2.3vw,3.8vh),28px)] font-extrabold text-display-bg">
              <span className="flex items-center gap-2">
                <PixelIcon className="size-6" name="play" />
                {copy.play}
              </span>
            </span>
          </button>
        ) : null}
      </div>
    </TouchAppShell>
  );
}
