/* ============================================
   INPUT HANDLER
   Tracks which keys are currently held down.
   Games just ask "isDown('ArrowUp')" instead of
   each writing their own keydown/keyup listeners.
   ============================================ */

export class Input {
  constructor() {
    this.keysDown = new Set();

    // Store bound versions so we can remove them later if needed
    this._onKeyDown = (e) => this.keysDown.add(e.key);
    this._onKeyUp = (e) => this.keysDown.delete(e.key);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  isDown(key) {
    return this.keysDown.has(key);
  }

  // Lets on-screen touch buttons pretend to be a keyboard key,
  // so games never need a separate "touch" code path.
  simulateKeyDown(key) {
    this.keysDown.add(key);
  }

  simulateKeyUp(key) {
    this.keysDown.delete(key);
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}