import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initReviews() {
  const section = document.querySelector('.reviews');
  if (!section) return;

  gsap.fromTo('.reviews__stars-fill', { clipPath: 'inset(0 100% 0 0)' }, {
    clipPath: 'inset(0 0% 0 0)',
    duration: 2,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.reviews__score', start: 'top 85%' },
  });
  gsap.from('.reviews__number', {
    scale: 0.4,
    opacity: 0,
    filter: 'blur(20px)',
    duration: 1.6,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.reviews__score', start: 'top 85%' },
  });

  gsap.from('.review', {
    y: 120,
    rotationX: -25,
    opacity: 0,
    transformPerspective: 1000,
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.15,
    scrollTrigger: { trigger: '.reviews__grid', start: 'top 85%' },
  });
  gsap.fromTo('.review', { yPercent: (i) => [10, -6, 14][i] || 0 }, {
    yPercent: (i) => [-10, 6, -14][i] || 0,
    ease: 'none',
    scrollTrigger: { trigger: '.reviews__grid', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // Endlos-Laufband, das mit der Scroll-Geschwindigkeit beschleunigt und sich neigt
  const track = section.querySelector('.marquee__track');
  const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  const skew = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3' });
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const v = self.getVelocity();
      const boost = 1 + Math.min(Math.abs(v) / 400, 6);
      gsap.to(loop, { timeScale: v < 0 ? -boost : boost, duration: 0.2, overwrite: true });
      gsap.to(loop, { timeScale: v < 0 ? -1 : 1, duration: 1.2, delay: 0.2 });
      skew(gsap.utils.clamp(-12, 12, v / -250));
    },
  });
}
