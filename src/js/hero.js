import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { mulberry32 } from './textures.js';

const NS = 'http://www.w3.org/2000/svg';

// Dorf-Silhouette mit Zwiebelturm-Kirche – ein Gruß ans Allgäu.
function buildVillage(svg) {
  const rnd = mulberry32(42);
  const ground = 350;
  let shapes = '';
  const windows = [];
  let x = -30;
  while (x < 1480) {
    if (x > 820 && x < 900) {
      // Kirche mit Zwiebelturm
      const cx = 860;
      shapes += `M${cx - 22} 400V210h44V400Z`;
      shapes += `M${cx} 132c16 20 28 30 22 52-4 12-12 16-2 26h-40c10-10 2-14-2-26-6-22 6-32 22-52Z`;
      shapes += `M${cx - 2} 108h4v26h-4ZM${cx - 8} 116h16v4h-16Z`;
      shapes += `M${cx + 22} 400V300l70-50 70 50V400Z`;
      windows.push([cx - 5, 240, 10, 18]);
      x = 1010;
      continue;
    }
    const w = 70 + rnd() * 80;
    const wall = 34 + rnd() * 42;
    const pitch = w * (0.36 + rnd() * 0.18);
    const top = ground - wall;
    const over = 8;
    shapes += `M${x} 400V${top}H${x + w}V400Z`;
    shapes += `M${x - over} ${top + 4}L${x + w / 2} ${top - pitch}L${x + w + over} ${top + 4}Z`;
    if (rnd() > 0.55) shapes += `M${x + w * 0.7} ${top - pitch * 0.2}v-${pitch * 0.45}h9v${pitch * 0.45}Z`;
    const nWin = Math.floor(w / 34);
    for (let i = 0; i < nWin; i++) {
      if (rnd() < 0.45) windows.push([x + 12 + i * 32, top + 12 + rnd() * 6, 12, 14]);
    }
    if (rnd() < 0.35) {
      // Baum
      const tx = x + w + 12;
      const th = 50 + rnd() * 40;
      shapes += `M${tx} ${ground}l${-14} 0l14 ${-th}l14 ${th}Z`;
    }
    x += w + 18 + rnd() * 40;
  }
  // Alle Teilpfade im Uhrzeigersinn, sonst entstehen Löcher (nonzero fill)
  shapes += `M-40 400V${ground}H1480V400Z`;

  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', shapes);
  path.setAttribute('class', 'village');
  svg.appendChild(path);

  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'village__windows');
  windows.forEach(([wx, wy, ww, wh]) => {
    const r = document.createElementNS(NS, 'rect');
    Object.entries({ x: wx, y: wy, width: ww, height: wh, rx: 1.5 }).forEach(([k, v]) => r.setAttribute(k, v));
    g.appendChild(r);
  });
  svg.appendChild(g);
  return g.querySelectorAll('rect');
}

function initParticles(canvas, hero) {
  const ctx = canvas.getContext('2d');
  let w;
  let h;
  let dpr;
  let running = false;
  const mouse = { x: -9999, y: -9999 };
  const drops = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = canvas.offsetWidth * dpr;
    h = canvas.height = canvas.offsetHeight * dpr;
    drops.length = 0;
    const n = Math.round(Math.min(140, (canvas.offsetWidth * canvas.offsetHeight) / 9000));
    for (let i = 0; i < n; i++) {
      drops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (0.6 + Math.random() * 2.2) * dpr,
        vy: -(0.1 + Math.random() * 0.45) * dpr,
        vx: 0,
        tw: Math.random() * Math.PI * 2,
        z: Math.random(),
      });
    }
  }

  function frame(t) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    drops.forEach((d) => {
      const dx = d.x - mouse.x;
      const dy = d.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      const R = 140 * dpr;
      if (dist < R) {
        const f = (1 - dist / R) * 1.4;
        d.vx += (dx / dist) * f;
        d.y += (dy / dist) * f;
      }
      d.vx *= 0.92;
      d.x += d.vx + Math.sin(t / 1500 + d.tw) * 0.15 * dpr;
      d.y += d.vy * (0.5 + d.z);
      if (d.y < -10) {
        d.y = h + 10;
        d.x = Math.random() * w;
      }
      const a = 0.25 + 0.55 * Math.abs(Math.sin(t / 900 + d.tw)) * (0.4 + d.z * 0.6);
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 3);
      g.addColorStop(0, `rgba(200,235,255,${a})`);
      g.addColorStop(0.35, `rgba(120,190,255,${a * 0.35})`);
      g.addColorStop(1, 'rgba(120,190,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r * 3, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener('resize', resize);
  hero.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * dpr;
    mouse.y = (e.clientY - r.top) * dpr;
  });
  hero.addEventListener('pointerleave', () => {
    mouse.x = mouse.y = -9999;
  });

  ScrollTrigger.create({
    trigger: hero,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      running = self.isActive;
      if (running) requestAnimationFrame(frame);
    },
  });
}

export function initHero({ reduced }) {
  const hero = document.querySelector('.hero');
  if (!hero) return { intro: () => {} };

  const windows = buildVillage(hero.querySelector('.layer--village'));
  initParticles(hero.querySelector('.hero__particles'), hero);

  // Warme Fensterlichter flackern zufällig
  if (!reduced) {
    windows.forEach((win) => {
      gsap.to(win, {
        opacity: () => 0.35 + Math.random() * 0.5,
        duration: () => 0.8 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 3,
        ease: 'sine.inOut',
      });
    });
  }

  const line1 = hero.querySelector('.hero__line--1');
  const split = SplitText.create(line1, { type: 'chars', charsClass: 'char' });

  // Scroll: Inhalt zoomt weg, Ebenen verschieben sich mit unterschiedlicher Tiefe
  const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero__content', { yPercent: -30, scale: 0.86, opacity: 0, filter: 'blur(10px)', ease: 'none', scrollTrigger: st });
  gsap.to('.layer--far', { yPercent: 28, ease: 'none', scrollTrigger: st });
  gsap.to('.layer--mid', { yPercent: 16, ease: 'none', scrollTrigger: st });
  gsap.to('.layer--village', { yPercent: 4, scale: 1.08, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__glow--a', { yPercent: 60, scale: 1.4, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__glow--b', { yPercent: 30, xPercent: -20, ease: 'none', scrollTrigger: st });
  gsap.to('.scroll-hint', { opacity: 0, y: 20, ease: 'none', scrollTrigger: { ...st, end: '15% top' } });

  // Maus-Parallax
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    const layers = [
      ['.layer--far', 12],
      ['.layer--mid', 24],
      ['.layer--village', 40],
      ['.hero__glow--a', -60],
    ].map(([sel, depth]) => ({ x: gsap.quickTo(sel, 'x', { duration: 1.2, ease: 'power3' }), depth }));
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      layers.forEach((l) => l.x(-nx * l.depth));
    });
  }

  function intro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    // Intro animiert die Eltern-Container, damit es keine Konflikte mit den Scroll-Tweens gibt
    tl.from('.hero__sky', { opacity: 0, scale: 0.7, duration: 2.4 }, 0)
      .from('.hero__landscape', { yPercent: 35, opacity: 0, duration: 2.2 }, 0.1)
      .from('.hero__eyebrow', { y: 20, opacity: 0, duration: 1.2 }, 0.4)
      .from(
        split.chars,
        {
          yPercent: 120,
          rotationX: -90,
          opacity: 0,
          filter: 'blur(14px)',
          transformOrigin: '50% 100%',
          duration: 1.4,
          stagger: 0.035,
        },
        0.5,
      )
      .from('.hero__line--2', { yPercent: 40, scale: 1.15, opacity: 0, filter: 'blur(24px)', duration: 1.8 }, 0.9)
      .from('.hero__sub', { y: 30, opacity: 0, duration: 1.2 }, 1.3)
      .from('.hero__cta > *', { y: 24, opacity: 0, duration: 1, stagger: 0.1 }, 1.45)
      .from('.hero__badges > *', { y: 16, opacity: 0, duration: 1, stagger: 0.1 }, 1.6)
      .from('.scroll-hint', { opacity: 0, duration: 1 }, 2)
      .from('.nav', { yPercent: -100, duration: 1.2, clearProps: 'transform' }, 1.2);
    return tl;
  }

  return { intro };
}
