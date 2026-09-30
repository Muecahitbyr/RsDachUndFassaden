import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initNav() {
  const nav = document.querySelector('.nav');
  const burger = nav.querySelector('.nav__burger');
  const menu = document.getElementById('mobileMenu');
  const progress = nav.querySelector('.nav__progress');
  const links = [...nav.querySelectorAll('.nav__links a')];

  // Ein-/Ausblenden je nach Scrollrichtung + Fortschrittsbalken
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      progress.style.transform = `scaleX(${self.progress})`;
      const y = self.scroll();
      nav.classList.toggle('nav--scrolled', y > 20);
      if (!document.documentElement.classList.contains('menu-open')) {
        nav.classList.toggle('nav--hidden', self.direction === 1 && y > 600);
      }
    },
  });

  // Hell/Dunkel-Theme je nach Sektion unter der Navigation
  document.querySelectorAll('main section[data-theme], footer[data-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 24px',
      end: 'bottom 24px',
      onToggle: (self) => self.isActive && (nav.dataset.theme = sec.dataset.theme),
    });
    if (sec.id) {
      const link = links.find((a) => a.getAttribute('href') === `#${sec.id}`);
      if (link) {
        ScrollTrigger.create({
          trigger: sec,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => link.classList.toggle('is-active', self.isActive),
        });
      }
    }
  });

  const setOpen = (open) => {
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    menu.setAttribute('aria-hidden', String(!open));
  };
  burger.addEventListener('click', () => setOpen(!document.documentElement.classList.contains('menu-open')));
  document.addEventListener('menu:close', () => setOpen(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));
}
