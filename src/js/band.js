import { gsap } from 'gsap';

// Bildband: öffnet sich beim Hineinscrollen von einer gerahmten Karte zum Vollbild.
export function initBand() {
  document.querySelectorAll('.band').forEach((band) => {
    const frame = band.querySelector('.band__frame');
    const img = band.querySelector('.band__img');
    gsap.fromTo(
      frame,
      { clipPath: 'inset(10% 7% 10% 7% round 22px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'top top', scrub: true } },
    );
    gsap.fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'top top', scrub: true } });
    gsap.to(img, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: band, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from(band.querySelectorAll('.band__caption > *'), {
      y: 40,
      opacity: 0,
      duration: 1.2,
      stagger: 0.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: band, start: 'top 20%' },
    });
  });

  // Kontakt-Hintergrund leicht versetzt
  gsap.fromTo('.contact__bg', { yPercent: -8 }, {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true },
  });
}
