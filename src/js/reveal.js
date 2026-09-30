import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export function initReveals() {
  // Überschriften: Wörter gleiten aus einer Maske
  document.querySelectorAll('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines,words', mask: 'lines', linesClass: 'split-line' });
    gsap.from(split.words, {
      yPercent: 110,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Allgemeine Elemente: weich mit Blur einblenden
  gsap.set('[data-reveal]', { opacity: 0, y: 36 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.08 }),
  });

  document.querySelectorAll('[data-reveal-scale]').forEach((el) => {
    gsap.fromTo(
      el,
      { scale: 0.9, opacity: 0.5 },
      { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 1 } },
    );
  });

  // Apple-typischer Wort-für-Wort-Text, der beim Scrollen aufleuchtet
  document.querySelectorAll('[data-word-reveal]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words', wordsClass: 'w' });
    gsap.fromTo(
      split.words,
      { opacity: 0.18 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      },
    );
  });

  // Zähler
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const decimals = Number(el.dataset.decimals || 0);
    const obj = { v: 0 };
    const fmt = (v) => v.toFixed(decimals).replace('.', ',');
    el.textContent = fmt(0);
    gsap.to(obj, {
      v: target,
      duration: 2,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onUpdate: () => (el.textContent = fmt(obj.v)),
    });
  });
}
