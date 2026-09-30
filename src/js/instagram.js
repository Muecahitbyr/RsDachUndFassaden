import { gsap } from 'gsap';
import { company } from '../data/company.js';

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

  // Platzhalter-Kacheln (bewusst unscharf – der echte Feed lädt erst nach Einwilligung)
  const thumbs = ['roof-red', 'facade-yellow', 'solar-house', 'roof-dormers', 'roof-ridge', 'house-brick', 'roof-tiles', 'house-ivy', 'solar-field'];
  thumbs.forEach((name) => {
    const tile = document.createElement('span');
    tile.className = 'ig__tile';
    tile.innerHTML = `<img src="/images/thumbs/${name}.webp" alt="" loading="lazy" width="360" height="360" />`;
    grid.appendChild(tile);
  });

  gsap.from(grid.children, {
    opacity: 0,
    y: 12,
    duration: 0.8,
    ease: 'power3.out',
    stagger: { each: 0.05, grid: [3, 3], from: 'start' },
    scrollTrigger: { trigger: '.phone', start: 'top 70%' },
  });

  // Telefon dreht sich beim Scrollen in die Frontansicht
  gsap.fromTo(
    '.phone',
    { rotationY: -14, rotationX: 6, y: 80 },
    {
      rotationY: 0,
      rotationX: 0,
      y: 0,
      ease: 'none',
      transformPerspective: 1400,
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'center center', scrub: 1 },
    },
  );
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
