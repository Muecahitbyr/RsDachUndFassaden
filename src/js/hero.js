import { gsap } from 'gsap';
import { renderRoof } from './textures.js';

// Hero: Dachfläche als ruhiger Hintergrund, Parallax beim Scrollen, Maskenreveal der Headline.
export function initHero({ reduced }) {
  const hero = document.querySelector('.hero');
  if (!hero) return { intro: () => {} };

  const canvas = hero.querySelector('.hero__canvas');
  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(canvas.offsetWidth * dpr);
    const h = Math.round(canvas.offsetHeight * dpr);
    if (!w || !h || w === canvas.width) return;
    canvas.width = w;
    canvas.height = h;
    renderRoof(canvas.getContext('2d'), w, h, { dirty: false, seed: 9, tileW: Math.max(36, w / 22) });
  };
  draw();
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(draw, 200);
  });

  const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero__media', { yPercent: 14, scale: 1.08, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__inner', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '70% top' } });
  gsap.to('.hero__facts', { y: -30, opacity: 0, ease: 'none', scrollTrigger: { ...st, start: '20% top', end: '60% top' } });

  // Dezente Maus-Parallax auf der Dachfläche
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    const mx = gsap.quickTo('.hero__canvas', 'x', { duration: 1.6, ease: 'power3' });
    const my = gsap.quickTo('.hero__canvas', 'y', { duration: 1.6, ease: 'power3' });
    gsap.set('.hero__canvas', { scale: 1.04 });
    hero.addEventListener('pointermove', (e) => {
      mx((e.clientX / window.innerWidth - 0.5) * -18);
      my((e.clientY / window.innerHeight - 0.5) * -12);
    });
  }

  function intro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero__canvas', { opacity: 0, scale: 1.18, duration: 2.6, ease: 'power3.out' }, 0)
      .from('.hero__eyebrow', { y: 16, opacity: 0, duration: 1 }, 0.3)
      .from('.hero__line > span', { yPercent: 110, duration: 1.4, stagger: 0.12 }, 0.4)
      .from('.hero__sub', { y: 24, opacity: 0, duration: 1.2 }, 0.9)
      .from('.hero__cta > *', { y: 20, opacity: 0, duration: 1, stagger: 0.08 }, 1.05)
      .from('.facts', { opacity: 0, duration: 1 }, 1.2)
      .from('.facts__item', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 1.25)
      .from('.nav', { yPercent: -100, duration: 1.2, clearProps: 'transform' }, 0.8);
    return tl;
  }

  return { intro };
}
