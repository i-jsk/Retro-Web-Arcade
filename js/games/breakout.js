/* ============================================
   BREAKOUT
   Continuous-movement canvas game: paddle, ball,
   and a brick grid. This is a deliberate step up
   from Snake's grid-based logic - here everything
   moves in fractional pixels using velocity, and
   collision is real rectangle-vs-circle math
   instead of "do two grid cells match."
   ============================================ */

import { GameLoop } from '../engine/gameLoop.js';
import { Input } from '../engine/input.js';
import { getHighScore, setHighScore } from '../engine/scoreboard.js';

// ---------- Setup ----------

const GAME_NAME = 'breakout';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('game-overlay');
const overlayMessage = document.getElementById('overlay-message');
const startButton = document.getElementById('start-button');

const input = new Input();

// ---------- Tunable constants ----------

const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const PADDLE_Y = CANVAS_HEIGHT - 30;
const PADDLE_SPEED = 420;

const BALL_RADIUS = 7;
const BALL_SPEED = 260;

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_PADDING = 4;
const BRICK_TOP_OFFSET = 50;
const BRICK_HEIGHT = 18;
const BRICK_WIDTH = (CANVAS_WIDTH - BRICK_PADDING * (BRICK_COLS + 1)) / BRICK_COLS;

const STARTING_LIVES = 3;
const POINTS_PER_BRICK = 10;

const ROW_COLORS = ['#ff4d4d', '#ffb000', '#ffb000', '#3ec6d9', '#3ec6d9'];

// ---------- Game state ----------

let state = null;

function createBricks() {
  const bricks = [];
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: BRICK_PADDING + col * (BRICK_WIDTH + BRICK_PADDING),
        y: BRICK_TOP_OFFSET + row * (BRICK_HEIGHT + BRICK_PADDING),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        color: ROW_COLORS[row % ROW_COLORS.length],
        destroyed: false,
      });
    }
  }
  return bricks;
}

function createBallVelocity() {
  const angle = (Math.random() * 0.6 + 0.2) * Math.PI;
  return {
    x: Math.cos(angle) * BALL_SPEED,
    y: -Math.abs(Math.sin(angle) * BALL_SPEED),
  };
}

function createInitialState() {
  return {
    paddleX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    ball: {
      x: CANVAS_WIDTH / 2,
      y: PADDLE_Y - BALL_RADIUS - 1,
      velocity: createBallVelocity(),
    },
    bricks: createBricks(),
    score: 0,
    lives: STARTING_LIVES,
    isGameOver: false,
    isBallLaunched: false,
  };
}

// ---------- Touch drag control ----------

function getCanvasScaleX() {
  return CANVAS_WIDTH / canvas.getBoundingClientRect().width;
}

function handlePointerMove(clientX) {
  if (!state || state.isGameOver) return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = getCanvasScaleX();
  const relativeX = (clientX - rect.left) * scaleX;
  state.paddleX = clamp(relativeX - PADDLE_WIDTH / 2, 0, CANVAS_WIDTH - PADDLE_WIDTH);
}

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  handlePointerMove(e.touches[0].clientX);
}, { passive: false });

canvas.addEventListener('touchstart', (e) => {
  handlePointerMove(e.touches[0].clientX);
  launchBallIfWaiting();
}, { passive: false });

canvas.addEventListener('mousemove', (e) => handlePointerMove(e.clientX));

canvas.addEventListener('mousedown', () => launchBallIfWaiting());

function launchBallIfWaiting() {
  if (state && !state.isBallLaunched && !state.isGameOver) {
    state.isBallLaunched = true;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ---------- Update (game logic) ----------

function update(dt) {
  if (state.isGameOver) return;

  updatePaddleFromKeyboard(dt);

  if (!state.isBallLaunched) {
    state.ball.x = state.paddleX + PADDLE_WIDTH / 2;
    if (input.isDown(' ') || input.isDown('ArrowUp')) {
      state.isBallLaunched = true;
    }
    return;
  }

  moveBall(dt);
  handleWallCollisions();
  handlePaddleCollision();
  handleBrickCollisions();
  checkLifeLost();
  checkWin();
}

function updatePaddleFromKeyboard(dt) {
  const moveAmount = PADDLE_SPEED * dt;
  if (input.isDown('ArrowLeft') || input.isDown('a')) {
    state.paddleX = clamp(state.paddleX - moveAmount, 0, CANVAS_WIDTH - PADDLE_WIDTH);
  }
  if (input.isDown('ArrowRight') || input.isDown('d')) {
    state.paddleX = clamp(state.paddleX + moveAmount, 0, CANVAS_WIDTH - PADDLE_WIDTH);
  }
}

function moveBall(dt) {
  state.ball.x += state.ball.velocity.x * dt;
  state.ball.y += state.ball.velocity.y * dt;
}

function handleWallCollisions() {
  const { ball } = state;
  if (ball.x - BALL_RADIUS < 0) {
    ball.x = BALL_RADIUS;
    ball.velocity.x *= -1;
  } else if (ball.x + BALL_RADIUS > CANVAS_WIDTH) {
    ball.x = CANVAS_WIDTH - BALL_RADIUS;
    ball.velocity.x *= -1;
  }
  if (ball.y - BALL_RADIUS < 0) {
    ball.y = BALL_RADIUS;
    ball.velocity.y *= -1;
  }
}

function circleIntersectsRect(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return (dx * dx + dy * dy) < (BALL_RADIUS * BALL_RADIUS);
}

function handlePaddleCollision() {
  const { ball } = state;
  const paddleRect = { x: state.paddleX, y: PADDLE_Y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };

  if (ball.velocity.y > 0 && circleIntersectsRect(ball, paddleRect)) {
    const hitPosition = (ball.x - (state.paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
    const bounceAngle = hitPosition * (Math.PI / 3);

    const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
    ball.velocity.x = Math.sin(bounceAngle) * speed;
    ball.velocity.y = -Math.abs(Math.cos(bounceAngle) * speed);

    ball.y = PADDLE_Y - BALL_RADIUS - 1;
  }
}

function handleBrickCollisions() {
  const { ball } = state;
  for (const brick of state.bricks) {
    if (brick.destroyed) continue;
    if (circleIntersectsRect(ball, brick)) {
      brick.destroyed = true;
      state.score += POINTS_PER_BRICK;
      scoreEl.textContent = state.score;
      ball.velocity.y *= -1;
      break;
    }
  }
}

function checkLifeLost() {
  if (state.ball.y - BALL_RADIUS > CANVAS_HEIGHT) {
    state.lives -= 1;
    livesEl.textContent = state.lives;

    if (state.lives <= 0) {
      endGame(false);
      return;
    }

    state.paddleX = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    state.ball = {
      x: CANVAS_WIDTH / 2,
      y: PADDLE_Y - BALL_RADIUS - 1,
      velocity: createBallVelocity(),
    };
    state.isBallLaunched = false;
  }
}

function checkWin() {
  const anyBricksLeft = state.bricks.some((b) => !b.destroyed);
  if (!anyBricksLeft) {
    endGame(true);
  }
}

function endGame(didWin) {
  state.isGameOver = true;
  loop.pause();

  const isNewHighScore = setHighScore(GAME_NAME, state.score);
  highScoreEl.textContent = getHighScore(GAME_NAME);

  if (didWin) {
    overlayMessage.textContent = 'YOU WIN!';
  } else {
    overlayMessage.textContent = isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER';
  }
  startButton.textContent = 'RETRY';
  overlay.classList.remove('game-overlay--hidden');
}

// ---------- Render ----------

function render() {
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  drawBricks();
  drawPaddle();
  drawBall();
}

function drawBricks() {
  for (const brick of state.bricks) {
    if (brick.destroyed) continue;
    ctx.fillStyle = brick.color;
    ctx.shadowColor = brick.color;
    ctx.shadowBlur = 4;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  }
  ctx.shadowBlur = 0;
}

function drawPaddle() {
  ctx.fillStyle = '#ffb000';
  ctx.shadowColor = '#ffb000';
  ctx.shadowBlur = 8;
  ctx.fillRect(state.paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.shadowBlur = 0;
}

function drawBall() {
  ctx.fillStyle = '#3ec6d9';
  ctx.shadowColor = '#3ec6d9';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(state.ball.x, state.ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ---------- Game lifecycle ----------

const loop = new GameLoop({ update, render });

function startGame() {
  state = createInitialState();
  scoreEl.textContent = '0';
  livesEl.textContent = STARTING_LIVES;
  highScoreEl.textContent = getHighScore(GAME_NAME);
  overlay.classList.add('game-overlay--hidden');
  loop.start();
}

startButton.addEventListener('click', startGame);

highScoreEl.textContent = getHighScore(GAME_NAME);