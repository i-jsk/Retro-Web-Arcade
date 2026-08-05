/* ============================================
   TOUCH D-PAD
   Renders a 4-direction on-screen control pad
   and wires each button to Input.simulateKeyDown/Up,
   so any game using arrow keys gets touch support
   for free — no per-game touch logic needed.
   Only shown when the device supports touch.
   ============================================ */

export function createDPad(input, container) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return;

  const dpad = document.createElement('div');
  dpad.className = 'dpad';
  dpad.innerHTML = `
    <button class="dpad__btn dpad__btn--up" data-key="ArrowUp" aria-label="Up">&#9650;</button>
    <button class="dpad__btn dpad__btn--left" data-key="ArrowLeft" aria-label="Left">&#9664;</button>
    <button class="dpad__btn dpad__btn--right" data-key="ArrowRight" aria-label="Right">&#9654;</button>
    <button class="dpad__btn dpad__btn--down" data-key="ArrowDown" aria-label="Down">&#9660;</button>
  `;
  container.appendChild(dpad);

  dpad.querySelectorAll('.dpad__btn').forEach((btn) => {
    const key = btn.dataset.key;

    // touchstart/touchend (not click) so holding down works, matching held keys
    const press = (e) => {
      e.preventDefault(); // stops the browser from also firing a synthetic click/scroll
      input.simulateKeyDown(key);
      btn.classList.add('dpad__btn--active');
    };
    const release = (e) => {
      e.preventDefault();
      input.simulateKeyUp(key);
      btn.classList.remove('dpad__btn--active');
    };

    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });

    // Also support mouse, so it's testable on desktop by clicking
    btn.addEventListener('mousedown', press);
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
  });
}