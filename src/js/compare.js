import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { coverCanvas, grime, loadImage } from './photo.js';

// Foto, Verschmutzungsprofil und Bildausschnitt je Tab
const SCENES = {
  roof: { src: '/images/roof-red.webp', kind: 'roof', seed: 12, fx: 0.5, fy: 0.3 },
  facade: { src: '/images/facade-yellow.webp', kind: 'facade', seed: 4, fx: 0.5, fy: 0.35 },
  solar: { src: '/images/solar-field.webp', kind: 'solar', seed: 9, fx: 0.5, fy: 0.6 },
};

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
  const cache = new Map();
  let kind = 'roof';

  const setPos = (v) => {
    stage.style.setProperty('--pos', `${v}%`);
    range.value = v;
  };

  async function render() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(stage.offsetWidth * dpr);
    const h = Math.round(stage.offsetHeight * dpr);
    if (!w || !h) return;
    const key = `${kind}-${w}x${h}`;
    if (!cache.has(key)) {
      const sc = SCENES[kind];
      const img = await loadImage(sc.src);
      const clean = coverCanvas(img, w, h, sc.fx, sc.fy);
      cache.set(key, { clean, dirty: grime(clean, sc.kind, sc.seed) });
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
    tab.addEventListener('click', async () => {
      if (tab.dataset.kind === kind) return;
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      moveIndicator(tab);
      kind = tab.dataset.kind;
      await gsap.to([before, after], { opacity: 0, duration: 0.3, ease: 'power2.in' });
      await render();
      const obj = { v: 85 };
      gsap
        .timeline()
        .to([before, after], { opacity: 1, duration: 0.6, ease: 'power2.out' })
        .to(obj, { v: 50, duration: 1.1, ease: 'expo.out', onUpdate: () => setPos(obj.v) }, '<');
    });
  });

  range.addEventListener('input', () => setPos(Number(range.value)));
  setPos(50);
  render();
  Object.values(SCENES).forEach((sc) => loadImage(sc.src)); // Tabs vorladen
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
