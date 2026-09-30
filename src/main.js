import '@fontsource-variable/inter';
import './styles/main.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { initSmoothScroll } from './js/smooth-scroll.js';
import { runPreloader } from './js/preloader.js';
import { initHero } from './js/hero.js';
import { initCleanScene } from './js/clean-scene.js';
import { initBand } from './js/band.js';
import { initReveals } from './js/reveal.js';
import { initServices } from './js/services.js';
import { initPressure } from './js/pressure.js';
import { initCompare } from './js/compare.js';
import { initProcess } from './js/process.js';
import { initReviews } from './js/reviews.js';
import { initInstagram } from './js/instagram.js';
import { initHours } from './js/hours.js';
import { initNav } from './js/nav.js';
import { initMagnetic } from './js/magnetic.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) document.documentElement.classList.add('reduced-motion');

// Bei Reload immer oben starten – die gepinnten Szenen sind auf den Anfang ausgelegt
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

async function boot() {
  const loader = runPreloader({ reduced });
  await document.fonts.ready;

  initSmoothScroll({ reduced });
  initHours();

  // ScrollTrigger-Reihenfolge = Reihenfolge auf der Seite (wichtig für Pins)
  const hero = initHero({ reduced });
  initCleanScene();
  initBand();
  initServices();
  initPressure();
  initCompare();
  initProcess();
  initReviews();
  initInstagram();
  initReveals();
  initNav();
  initMagnetic({ reduced });

  ScrollTrigger.sort();
  ScrollTrigger.refresh();

  await loader;
  if (!reduced) hero.intro();
}

boot();
