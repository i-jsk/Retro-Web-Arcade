/* ============================================
   TIC-TAC-TOE
   No canvas/game loop needed here - this is a
   turn-based game, so it's driven entirely by
   click events rather than requestAnimationFrame.
   Demonstrates: DOM-based rendering, simple AI
   (rule-based, not machine learning), and win-
   condition checking against fixed line patterns.
   ============================================ */

import { getHighScore, setHighScore } from '../engine/scoreboard.js';

const boardEl = document.getElementById('ttt-board');
const statusEl = document.getElementById('ttt-status');
const modeSelectEl = document.getElementById('mode-select');
const resetBtn = document.getElementById('ttt-reset');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');

// All 8 possible ways to win on a 3x3 board, expressed as cell indices (0-8)
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],            // diagonals
];

let board = Array(9).fill(null); // null = empty, else 'X' or 'O'
let currentPlayer = 'X';
let mode = null; // 'cpu' or 'human'
let isGameOver = false;

function loadScores() {
  scoreXEl.textContent = getHighScore('tictactoe-x-wins');
  scoreOEl.textContent = getHighScore('tictactoe-o-wins');
}

function recordWin(player) {
  const key = player === 'X' ? 'tictactoe-x-wins' : 'tictactoe-o-wins';
  const newTotal = getHighScore(key) + 1;
  setHighScore(key, newTotal);
  loadScores();
}

// ---------- Rendering ----------

function renderBoard(winningLine = []) {
  boardEl.innerHTML = '';
  board.forEach((value, index) => {
    const cell = document.createElement('button');
    cell.className = 'ttt-cell';
    cell.dataset.index = index;

    if (value) {
      cell.classList.add('ttt-cell--filled', `ttt-cell--${value.toLowerCase()}`);
      cell.textContent = value;
    }
    if (winningLine.includes(index)) {
      cell.classList.add('ttt-cell--win');
    }

    cell.addEventListener('click', () => handleCellClick(index));
    boardEl.appendChild(cell);
  });
}

// ---------- Win / draw detection ----------

function findWinningLine(currentBoard) {
  return WIN_LINES.find(
    ([a, b, c]) =>
      currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]
  ) || null;
}

function isBoardFull(currentBoard) {
  return currentBoard.every((cell) => cell !== null);
}

// ---------- Game flow ----------

function handleCellClick(index) {
  if (isGameOver || board[index] || !mode) return;
  if (mode === 'cpu' && currentPlayer === 'O') return;

  playMove(index);
}

function playMove(index) {
  board[index] = currentPlayer;

  const winningLine = findWinningLine(board);
  if (winningLine) {
    renderBoard(winningLine);
    statusEl.textContent = `${currentPlayer} WINS!`;
    recordWin(currentPlayer);
    isGameOver = true;
    return;
  }

  if (isBoardFull(board)) {
    renderBoard();
    statusEl.textContent = "IT'S A DRAW";
    isGameOver = true;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  renderBoard();
  statusEl.textContent = `${currentPlayer}'S TURN`;

  if (mode === 'cpu' && currentPlayer === 'O' && !isGameOver) {
    setTimeout(cpuMove, 450);
  }
}

// ---------- Simple CPU opponent ----------

function cpuMove() {
  const emptyIndices = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((idx) => idx !== null);

  const winningMove = findMoveThatWins('O', emptyIndices);
  if (winningMove !== null) return playMove(winningMove);

  const blockingMove = findMoveThatWins('X', emptyIndices);
  if (blockingMove !== null) return playMove(blockingMove);

  if (emptyIndices.includes(4)) return playMove(4);

  const corners = [0, 2, 6, 8].filter((i) => emptyIndices.includes(i));
  if (corners.length) return playMove(corners[Math.floor(Math.random() * corners.length)]);

  playMove(emptyIndices[Math.floor(Math.random() * emptyIndices.length)]);
}

function findMoveThatWins(player, emptyIndices) {
  for (const index of emptyIndices) {
    const hypotheticalBoard = [...board];
    hypotheticalBoard[index] = player;
    if (findWinningLine(hypotheticalBoard)) return index;
  }
  return null;
}

// ---------- Setup ----------

function startNewGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  isGameOver = false;
  renderBoard();
  statusEl.textContent = "X'S TURN";
}

modeSelectEl.querySelectorAll('.ttt-mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    mode = btn.dataset.mode;
    modeSelectEl.querySelectorAll('.ttt-mode-btn').forEach((b) =>
      b.classList.toggle('ttt-mode-btn--active', b === btn)
    );
    startNewGame();
  });
});

resetBtn.addEventListener('click', () => {
  if (mode) startNewGame();
});

loadScores();
renderBoard();