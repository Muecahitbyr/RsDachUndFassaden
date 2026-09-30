import { gsap } from 'gsap';

const NS = 'http://www.w3.org/2000/svg';

// "250 bar": Zahl rast aus der Tiefe heran, der Druckring füllt sich.
export function initPressure() {
  const section = document.querySelector('.pressure');
  if (!section) return;
  const pin = section.querySelector('.pressure__pin');
  const ticks = section.querySelector('.pressure__ticks');
  const arc = section.querySelector('.pressure__arc');
  const value = section.querySelector('.pressure__value');

  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const long = i % 6 === 0;
    const r1 = 238;
    const r2 = long ? 214 : 226;
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', 300 + Math.cos(a) * r1);
    line.setAttribute('y1', 300 + Math.sin(a) * r1);
    line.setAttribute('x2', 300 + Math.cos(a) * r2);
    line.setAttribute('y2', 300 + Math.sin(a) * r2);
    if (long) line.setAttribute('class', 'long');
    ticks.appendChild(line);
  }
  const tickEls = ticks.querySelectorAll('line');

  const C = 2 * Math.PI * 270;
  gsap.set(arc, { strokeDasharray: C, strokeDashoffset: C });
  const counter = { v: 0 };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: pin, start: 'top top', end: '+=220%', pin: true, scrub: 1 },
  });
  tl.fromTo('.pressure__number', { scale: 2.6, opacity: 0, filter: 'blur(12px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 3, ease: 'power2.out' }, 0)
    .fromTo('.pressure__ring', { scale: 0.8, rotation: -150, opacity: 0 }, { scale: 1, rotation: -90, opacity: 1, duration: 4, ease: 'power2.out' }, 0.5)
    .to(arc, { strokeDashoffset: 0, duration: 4 }, 1.5)
    .to(counter, { v: 250, duration: 4, onUpdate: () => (value.textContent = Math.round(counter.v)) }, 1.5)
    .fromTo(tickEls, { opacity: 0.08 }, { opacity: 1, stagger: 4 / tickEls.length, duration: 0.2 }, 1.5)
    .from(['.pressure__center .eyebrow', '.pressure__caption'], { opacity: 0, y: 20, duration: 1, stagger: 0.3 }, 3.2)
    .from('.pressure__facts li', { opacity: 0, y: 30, duration: 1.2, stagger: 0.3 }, 5)
    .to({}, { duration: 1 });

  // Bento: Manometer-Nadel und Autark-Tank
  gsap.set('.gauge__needle', { svgOrigin: '100 110', rotation: -90 });
  gsap.to('.gauge__needle', {
    rotation: 70,
    duration: 2.2,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.tile--gauge', start: 'top 80%' },
  });
  gsap.fromTo('.gauge__fill', { strokeDasharray: 252, strokeDashoffset: 252 }, {
    strokeDashoffset: 252 * 0.11,
    duration: 2,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.tile--gauge', start: 'top 80%' },
  });
}
