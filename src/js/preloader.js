import { gsap } from 'gsap';

// Schlichter Einstieg: Logo, schmaler Ladebalken, Vorhang nach oben.
export function runPreloader({ reduced }) {
  const el = document.querySelector('.preloader');
  if (!el) return Promise.resolve();
  if (reduced) {
    el.remove();
    return Promise.resolve();
  }
  document.documentElement.classList.add('is-loading');

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        el.remove();
        document.documentElement.classList.remove('is-loading');
      },
    });
    tl.from('.preloader__logo', { opacity: 0, y: 10, duration: 0.8, ease: 'power3.out' }, 0)
      .from('.preloader__bar', { opacity: 0, duration: 0.4 }, 0.2)
      .to('.preloader__bar span', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.3)
      .to('.preloader__inner', { opacity: 0, y: -10, duration: 0.45, ease: 'power2.in' }, 1.45)
      .add(resolve, 1.7)
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, 1.7);
  });
}
