/* ============================================
   SNAKE
   Classic grid-based snake game using the
   Canvas 2D API. Built on top of the shared
   engine (GameLoop, Input, Scoreboard).
   ============================================ */

import { GameLoop } from '../engine/gameLoop.js';
import { Input } from '../engine/input.js';
import { getHighScore, setHighScore } from '../engine/scoreboard.js';
import { createDPad } from '../engine/dpad.js';

// ---------- Setup ----------

const GAME_NAME = 'snake';
const GRID_SIZE = 20;           // 20x20 grid
const CELL_SIZE = 400 / GRID_SIZE; // canvas is 400x400, so each cell is 20px
const MOVE_INTERVAL = 0.12;     // seconds between moves (controls snake speed)

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('game-overlay');
const overlayMessage = document.getElementById('overlay-message');
const startButton = document.getElementById('start-button');

const input = new Input();
createDPad(input, document.getElementById('dpad-wrap'));

// ---------- Game state ----------
// We keep all mutable state in one plain object.
// This makes it easy to reset() the whole game later.

let state = null;

function createInitialState() {
  return {
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    direction: { x: 1, y: 0 },   // moving right
    pendingDirection: { x: 1, y: 0 },
    food: spawnFood([{ x: 10, y: 10 }]),
    score: 0,
    timeSinceLastMove: 0,
    isGameOver: false,
  };
}

// Places food on a random empty cell (never on top of the snake)
function spawnFood(snakeBody) {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snakeBody.some((seg) => seg.x === position.x && seg.y === position.y));
  return position;
}

// ---------- Input handling ----------
// We translate raw key names into a direction vector.
// pendingDirection is used (not direction directly) so a fast double
// key-press this frame can't let the snake reverse into itself.

function readDirectionInput() {
  const { direction } = state;

  if ((input.isDown('ArrowUp') || input.isDown('w')) && direction.y === 0) {
    state.pendingDirection = { x: 0, y: -1 };
  } else if ((input.isDown('ArrowDown') || input.isDown('s')) && direction.y === 0) {
    state.pendingDirection = { x: 0, y: 1 };
  } else if ((input.isDown('ArrowLeft') || input.isDown('a')) && direction.x === 0) {
    state.pendingDirection = { x: -1, y: 0 };
  } else if ((input.isDown('ArrowRight') || input.isDown('d')) && direction.x === 0) {
    state.pendingDirection = { x: 1, y: 0 };
  }
}

// ---------- Update (game logic, runs every frame via dt) ----------

function update(dt) {
  if (state.isGameOver) return;

  readDirectionInput();

  state.timeSinceLastMove += dt;
  if (state.timeSinceLastMove < MOVE_INTERVAL) return;
  state.timeSinceLastMove = 0;

  state.direction = state.pendingDirection;

  const head = state.snake[0];
  const newHead = {
    x: head.x + state.direction.x,
    y: head.y + state.direction.y,
  };

  // Collision: walls
  const hitWall =
    newHead.x < 0 || newHead.x >= GRID_SIZE ||
    newHead.y < 0 || newHead.y >= GRID_SIZE;

  // Collision: self (check against every existing body segment)
  const hitSelf = state.snake.some(
    (seg) => seg.x === newHead.x && seg.y === newHead.y
  );

  if (hitWall || hitSelf) {
    endGame();
    return;
  }

  state.snake.unshift(newHead); // grow at the head

  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;
  if (ateFood) {
    state.score += 10;
    state.food = spawnFood(state.snake);
    scoreEl.textContent = state.score;
  } else {
    state.snake.pop(); // remove tail so the snake doesn't grow forever
  }
}

function endGame() {
  state.isGameOver = true;
  loop.pause();

  const isNewHighScore = setHighScore(GAME_NAME, state.score);
  highScoreEl.textContent = getHighScore(GAME_NAME);

  overlayMessage.textContent = isNewHighScore ? 'NEW HIGH SCORE!' : 'GAME OVER';
  startButton.textContent = 'RETRY';
  overlay.classList.remove('game-overlay--hidden');
}

// ---------- Render (drawing, runs every frame) ----------

function render() {
  // Clear the canvas each frame before redrawing
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawFood();
  drawSnake();
}

function drawSnake() {
  state.snake.forEach((segment, index) => {
    const isHead = index === 0;
    ctx.fillStyle = isHead ? '#ffb000' : '#c98900';
    ctx.shadowColor = '#ffb000';
    ctx.shadowBlur = isHead ? 8 : 0;
    ctx.fillRect(
      segment.x * CELL_SIZE + 1,
      segment.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );
  });
  ctx.shadowBlur = 0; // reset so it doesn't bleed into other draws
}

function drawFood() {
  ctx.fillStyle = '#3ec6d9';
  ctx.shadowColor = '#3ec6d9';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(
    state.food.x * CELL_SIZE + CELL_SIZE / 2,
    state.food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2.5,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ---------- Game lifecycle ----------

const loop = new GameLoop({ update, render });

function startGame() {
  state = createInitialState();
  scoreEl.textContent = '0';
  highScoreEl.textContent = getHighScore(GAME_NAME);
  overlay.classList.add('game-overlay--hidden');
  loop.start();
}

startButton.addEventListener('click', startGame);

// Show current high score immediately, even before first play
highScoreEl.textContent = getHighScore(GAME_NAME);