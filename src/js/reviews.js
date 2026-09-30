import { gsap } from 'gsap';

export function initReviews() {
  const section = document.querySelector('.reviews');
  if (!section) return;

  gsap.fromTo('.reviews__stars-fill', { clipPath: 'inset(0 100% 0 0)' }, {
    clipPath: 'inset(0 0% 0 0)',
    duration: 1.6,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.reviews__score', start: 'top 85%' },
  });

  gsap.from('.review', {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    stagger: 0.12,
    scrollTrigger: { trigger: '.reviews__grid', start: 'top 85%' },
  });
}
