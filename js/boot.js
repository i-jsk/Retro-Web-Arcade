/* ============================================
   BOOT SEQUENCE
   Plays the power-on animation, then reveals
   the arcade menu. Falls back instantly if the
   user prefers reduced motion.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const boot = document.getElementById('boot');
  const arcade = document.getElementById('arcade');

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const revealArcade = () => {
    boot.classList.add('boot--done');
    arcade.classList.add('arcade--visible');
  };

  if (prefersReducedMotion) {
    revealArcade();
    return;
  }

  // Wait for the boot text animation to finish (~2.4s), then reveal.
  // Also let a click/keypress skip it early, like a real arcade "press start".
  const bootTimer = setTimeout(revealArcade, 2600);

  const skipBoot = () => {
    clearTimeout(bootTimer);
    revealArcade();
  };

  document.addEventListener('keydown', skipBoot, { once: true });
  document.addEventListener('click', skipBoot, { once: true });
});
