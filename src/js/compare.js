import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { renderTexture } from './textures.js';

// Vorher/Nachher-Slider mit Tabs (Dach, Fassade, Solar).
export function initCompare() {
  const section = document.querySelector('.compare');
  if (!section) return;
  const stage = section.querySelector('.compare__stage');
  const before = stage.querySelector('.compare__before');
  const after = stage.querySelector('.compare__after');
  const range = stage.querySelector('.compare__range');
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  const indicator = section.querySelector('.compare__tabs-indicator');
  const seeds = { roof: 12, facade: 4, solar: 9 };
  const cache = new Map();
  let kind = 'roof';

  const setPos = (v) => {
    stage.style.setProperty('--pos', `${v}%`);
    range.value = v;
  };

  function render() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(stage.offsetWidth * dpr);
    const h = Math.round(stage.offsetHeight * dpr);
    if (!w || !h) return;
    const key = `${kind}-${w}x${h}`;
    if (!cache.has(key)) {
      cache.set(key, {
        dirty: renderTexture(kind, w, h, true, seeds[kind]),
        clean: renderTexture(kind, w, h, false, seeds[kind]),
      });
    }
    const t = cache.get(key);
    [
      [before, t.dirty],
      [after, t.clean],
    ].forEach(([c, src]) => {
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(src, 0, 0);
    });
  }

  function moveIndicator(tab) {
    indicator.style.width = `${tab.offsetWidth}px`;
    indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      if (tab.dataset.kind === kind) return;
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      moveIndicator(tab);
      kind = tab.dataset.kind;
      gsap
        .timeline()
        .to([before, after], { opacity: 0, scale: 1.04, filter: 'blur(8px)', duration: 0.35, ease: 'power2.in' })
        .add(render)
        .to([before, after], { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' })
        .fromTo(range, { value: 85 }, { value: 50, duration: 1, ease: 'expo.out', onUpdate: () => setPos(Number(range.value)) }, '<');
    });
  });

  range.addEventListener('input', () => setPos(Number(range.value)));
  setPos(50);
  render();
  requestAnimationFrame(() => moveIndicator(tabs[0]));

  // Teaser: Regler schwingt einmal hin und her, wenn der Slider ins Bild kommt
  const obj = { v: 50 };
  ScrollTrigger.create({
    trigger: stage,
    start: 'top 65%',
    once: true,
    onEnter: () =>
      gsap
        .timeline({ onUpdate: () => setPos(obj.v) })
        .to(obj, { v: 88, duration: 0.9, ease: 'power2.inOut' })
        .to(obj, { v: 12, duration: 1.2, ease: 'power2.inOut' })
        .to(obj, { v: 50, duration: 1, ease: 'expo.out' }),
  });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      cache.clear();
      render();
      moveIndicator(tabs.find((t) => t.getAttribute('aria-selected') === 'true'));
    }, 200);
  });
}
