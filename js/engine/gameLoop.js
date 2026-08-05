/* ============================================
   GAME LOOP ENGINE
   Every game (Snake, and later Tetris/Breakout)
   plugs into this same loop. It handles:
     - requestAnimationFrame timing
     - delta time (so speed is consistent
       regardless of screen refresh rate)
     - pause / resume
   This is the "engine layer" — the single
   biggest reason this project reads as more
   than a one-off script.
   ============================================ */

export class GameLoop {
  /**
   * @param {Object} options
   * @param {(dt: number) => void} options.update - called every frame with delta time in seconds
   * @param {() => void} options.render - called every frame to draw
   */
  constructor({ update, render }) {
    this.update = update;
    this.render = render;

    this.isRunning = false;
    this.isPaused = false;
    this.lastTimestamp = 0;

    // Bind once so we can add/remove this exact function reference
    this._tick = this._tick.bind(this);
  }

  // start() always (re)starts the loop from a clean state.
  // This is safe to call every time a new game begins (including Retry),
  // since it doesn't matter if a previous game had already run.
  start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this._tick);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    requestAnimationFrame(this._tick);
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
  }

  _tick(timestamp) {
    if (!this.isRunning || this.isPaused) return;

    const dt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame(this._tick);
  }
}