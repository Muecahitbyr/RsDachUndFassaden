import { gsap } from 'gsap';

// Buttons folgen leicht dem Cursor; Karten kippen in 3D.
export function initMagnetic({ reduced }) {
  if (reduced || !matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.magnetic').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.12);
      y((e.clientY - (r.top + r.height / 2)) * 0.12);
    });
    el.addEventListener('pointerleave', () => {
      x(0);
      y(0);
    });
  });

  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.8, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.8, ease: 'power3' });
    gsap.set(el, { transformPerspective: 900 });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      ry((nx - 0.5) * 5);
      rx(-(ny - 0.5) * 5);
      el.style.setProperty('--mx', `${nx * 100}%`);
      el.style.setProperty('--my', `${ny * 100}%`);
    });
    el.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });

  // Spotlight-Rand für Bento-Kacheln
  document.querySelectorAll('.tile').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}
