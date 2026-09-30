import { gsap } from 'gsap';

// Logo erscheint, ein Wasser-Ring läuft einmal herum, dann fährt der Vorhang hoch.
export function runPreloader({ reduced }) {
  const el = document.querySelector('.preloader');
  if (!el) return Promise.resolve();
  if (reduced) {
    el.remove();
    return Promise.resolve();
  }
  document.documentElement.classList.add('is-loading');
  const count = el.querySelector('.preloader__count span');
  const ring = el.querySelector('.preloader__ring-fill');
  const C = 2 * Math.PI * 56;
  const counter = { v: 0 };
  gsap.set(ring, { strokeDasharray: C, strokeDashoffset: C });

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        el.remove();
        document.documentElement.classList.remove('is-loading');
      },
    });
    tl.from('.preloader__logo img', { scale: 0.6, opacity: 0, filter: 'blur(12px)', duration: 1, ease: 'expo.out' }, 0)
      .to(ring, { strokeDashoffset: 0, duration: 1.9, ease: 'power2.inOut' }, 0.1)
      .to(counter, { v: 100, duration: 1.9, ease: 'power2.inOut', onUpdate: () => (count.textContent = Math.round(counter.v)) }, 0.1)
      .to('.preloader__logo', { scale: 1.08, duration: 0.3, ease: 'power2.out' }, 2)
      .to('.preloader__inner', { scale: 0.85, opacity: 0, filter: 'blur(10px)', duration: 0.6, ease: 'power2.in' }, 2.2)
      .add(resolve, 2.45)
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, 2.45);
  });
}
