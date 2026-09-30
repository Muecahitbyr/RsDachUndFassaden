import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Linie wächst mit dem Scrollen, Schritte leuchten nacheinander auf.
export function initProcess() {
  const wrap = document.querySelector('.process__steps');
  if (!wrap) return;
  const line = wrap.querySelector('.process__line span');
  gsap.fromTo(line, { scaleY: 0 }, {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: wrap, start: 'top 60%', end: 'bottom 60%', scrub: true },
  });
  wrap.querySelectorAll('.step').forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 60%',
      onEnter: () => step.classList.add('is-active'),
      onLeaveBack: () => step.classList.remove('is-active'),
    });
    gsap.from(step, { x: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: step, start: 'top 85%' } });
  });
}
