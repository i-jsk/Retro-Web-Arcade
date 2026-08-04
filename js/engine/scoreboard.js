/* ============================================
   SCOREBOARD
   Thin wrapper around localStorage so every
   game can save/read a high score using the
   same two functions, keyed by game name.
   ============================================ */

const STORAGE_PREFIX = 'retro-arcade-highscore-';

export function getHighScore(gameName) {
  const raw = localStorage.getItem(STORAGE_PREFIX + gameName);
  return raw ? parseInt(raw, 10) : 0;
}

export function setHighScore(gameName, score) {
  const current = getHighScore(gameName);
  if (score > current) {
    localStorage.setItem(STORAGE_PREFIX + gameName, String(score));
    return true; // new high score
  }
  return false;
}
