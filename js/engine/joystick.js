/* ============================================
   TOUCH JOYSTICK
   An analog-feel virtual joystick: a draggable
   thumb inside a fixed base. As the user drags,
   we calculate the angle and translate it into
   the same simulateKeyDown/Up calls the D-pad
   uses — so Snake (or any game) doesn't need to
   know or care whether input came from keyboard,
   D-pad, or joystick.

   Interaction model differs from the D-pad on
   purpose: instead of 4 fixed buttons, this is
   one continuous drag surface. We compute the
   angle of the drag vector and snap it to the
   nearest of 4 cardinal directions (up/down/
   left/right), since Snake only moves on a grid
   and has no use for diagonal input anyway.
   ============================================ */

export function createJoystick(input, container) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isTouchDevice) return;

  const joystick = document.createElement('div');
  joystick.className = 'joystick';
  joystick.innerHTML = `
    <div class="joystick__base">
      <div class="joystick__thumb"></div>
    </div>
  `;
  container.appendChild(joystick);

  const base = joystick.querySelector('.joystick__base');
  const thumb = joystick.querySelector('.joystick__thumb');

  // Maximum distance (px) the thumb can visually travel from center.
  // Kept smaller than the base radius so the thumb never fully leaves the base.
  const MAX_THUMB_TRAVEL = 34;

  // Dead zone: drags shorter than this (px) don't count as a direction yet.
  // Prevents tiny accidental finger jitter from being read as input.
  const DEAD_ZONE = 12;

  let activeTouchId = null;
  let currentKey = null; // the single ArrowX key currently "held" by the joystick

  function setDirection(newKey) {
    if (newKey === currentKey) return;
    // Release whichever direction was previously simulated, so we
    // never leave a stale key "stuck" as held when the direction changes.
    if (currentKey) input.simulateKeyUp(currentKey);
    if (newKey) input.simulateKeyDown(newKey);
    currentKey = newKey;
  }

  // Converts a drag vector (dx, dy) into one of 4 cardinal keys, or null
  // if the drag is still inside the dead zone.
  function vectorToKey(dx, dy) {
    const distance = Math.hypot(dx, dy);
    if (distance < DEAD_ZONE) return null;

    // atan2 gives the angle of the vector; comparing |dx| vs |dy|
    // tells us whether the drag is more horizontal or vertical,
    // which is simpler and more reliable for 4-direction snapping
    // than working in raw degrees.
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'ArrowRight' : 'ArrowLeft';
    }
    return dy > 0 ? 'ArrowDown' : 'ArrowUp';
  }

  function moveThumb(dx, dy) {
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, MAX_THUMB_TRAVEL);
    const angle = Math.atan2(dy, dx);
    const thumbX = Math.cos(angle) * clampedDistance;
    const thumbY = Math.sin(angle) * clampedDistance;
    thumb.style.transform = `translate(${thumbX}px, ${thumbY}px)`;
  }

  function resetThumb() {
    thumb.style.transform = 'translate(0, 0)';
  }

  function getBaseCenter() {
    const rect = base.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function handleStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    activeTouchId = touch.identifier;
    thumb.style.transition = 'none'; // instant tracking while dragging
    handleMove(e);
  }

  function handleMove(e) {
    if (activeTouchId === null) return;
    e.preventDefault();

    const touch = Array.from(e.changedTouches).find((t) => t.identifier === activeTouchId);
    if (!touch) return;

    const center = getBaseCenter();
    const dx = touch.clientX - center.x;
    const dy = touch.clientY - center.y;

    moveThumb(dx, dy);
    setDirection(vectorToKey(dx, dy));
  }

  function handleEnd(e) {
    const touch = Array.from(e.changedTouches).find((t) => t.identifier === activeTouchId);
    if (!touch) return;

    activeTouchId = null;
    thumb.style.transition = 'transform 0.15s ease-out'; // smooth snap-back
    resetThumb();
    setDirection(null);
  }

  base.addEventListener('touchstart', handleStart, { passive: false });
  base.addEventListener('touchmove', handleMove, { passive: false });
  base.addEventListener('touchend', handleEnd, { passive: false });
  base.addEventListener('touchcancel', handleEnd, { passive: false });
}