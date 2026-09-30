import { gsap } from 'gsap';

// Dezenter Custom-Cursor (nur Maus/Trackpad).
export function initCursor({ reduced }) {
  const el = document.querySelector('.cursor');
  if (!el || reduced || !matchMedia('(pointer: fine)').matches) {
    el?.remove();
    return;
  }
  document.documentElement.classList.add('has-cursor');
  const dot = el.querySelector('.cursor__dot');
  const ring = el.querySelector('.cursor__ring');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

  window.addEventListener('pointermove', (e) => {
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
    el.classList.add('is-visible');
  });
  document.addEventListener('pointerleave', () => el.classList.remove('is-visible'));
  document.addEventListener('pointerover', (e) => {
    const hit = e.target.closest('a, button, input[type="range"], [data-tilt]');
    el.classList.toggle('is-hover', !!hit);
    el.classList.toggle('is-drag', !!e.target.closest('.compare__stage'));
  });
  window.addEventListener('pointerdown', () => el.classList.add('is-down'));
  window.addEventListener('pointerup', () => el.classList.remove('is-down'));
}
