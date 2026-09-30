import { gsap } from 'gsap';
import { company } from '../data/company.js';
import { renderTexture } from './textures.js';

// Instagram: stilisierte Profil-Vorschau im iPhone. Das echte Profil wird erst
// nach Klick geladen (2-Klick-Lösung, DSGVO-freundlich).
export function initInstagram() {
  const section = document.querySelector('.insta');
  if (!section) return;

  const grid = section.querySelector('[data-ig-grid]');
  const screen = section.querySelector('.phone__screen');
  const consent = section.querySelector('[data-ig-consent]');
  const loadBtn = section.querySelector('[data-ig-load]');
  const postsWrap = section.querySelector('[data-ig-posts]');

  // Vorschau-Kacheln aus den prozeduralen Texturen
  const kinds = ['roof', 'facade', 'solar', 'roof', 'solar', 'facade', 'roof', 'facade', 'roof'];
  kinds.forEach((kind, i) => {
    const a = document.createElement('a');
    a.href = company.instagram.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'ig__tile';
    a.setAttribute('aria-label', 'Beitrag auf Instagram ansehen');
    const c = renderTexture(kind, 220, 220, i % 4 === 1, 30 + i);
    a.appendChild(c);
    if (i % 3 === 0) a.insertAdjacentHTML('beforeend', '<span class="ig__tag">Vorher → Nachher</span>');
    grid.appendChild(a);
  });

  gsap.from(grid.children, {
    scale: 0.6,
    opacity: 0,
    duration: 0.9,
    ease: 'back.out(1.6)',
    stagger: { each: 0.06, grid: [3, 3], from: 'center' },
    scrollTrigger: { trigger: '.phone', start: 'top 70%' },
  });

  // Telefon dreht sich beim Scrollen in die Frontansicht
  gsap.fromTo(
    '.phone',
    { rotationY: -32, rotationX: 14, rotationZ: -6, y: 120 },
    {
      rotationY: 0,
      rotationX: 0,
      rotationZ: 0,
      y: -40,
      ease: 'none',
      transformPerspective: 1400,
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'center center', scrub: 1 },
    },
  );
  gsap.to('.insta__blobs span', {
    yPercent: (i) => [-40, 30, -60][i],
    xPercent: (i) => [20, -30, 10][i],
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
  });

  loadBtn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.instagram.com/${company.instagram.handle}/embed`;
    iframe.title = `Instagram-Profil @${company.instagram.handle}`;
    iframe.loading = 'lazy';
    iframe.className = 'ig-frame';
    iframe.setAttribute('allowtransparency', 'true');
    screen.appendChild(iframe);
    gsap.to(consent, { autoAlpha: 0, y: 20, duration: 0.4 });
    gsap.fromTo(iframe, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.6 });

    // Optionale Einzelbeiträge (siehe src/data/company.js)
    if (company.instagram.posts.length) {
      postsWrap.hidden = false;
      postsWrap.innerHTML = company.instagram.posts
        .map((url) => `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"></blockquote>`)
        .join('');
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(s);
    }
  });
}
