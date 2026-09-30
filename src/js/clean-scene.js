import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createCanvas, renderRoof } from './textures.js';

// Gepinnte Szene: Beim Scrollen fährt eine Hochdrucklanze Bahn für Bahn über das
// verschmutzte Dach und legt die sauberen Ziegel frei.
export function initCleanScene() {
  const section = document.querySelector('.clean-scene');
  if (!section) return;

  const canvas = section.querySelector('#roofCanvas');
  const stage = section.querySelector('.clean-scene__stage');
  const ctx = canvas.getContext('2d');
  const caps = [...section.querySelectorAll('.caption')];
  const meterValue = section.querySelector('.clean-scene__meter-value');
  const meterBar = section.querySelector('.clean-scene__meter-bar span');

  const LANES = 5;
  const state = { p: 0 };
  const particles = [];
  let W = 0;
  let H = 0;
  let dpr = 1;
  let dirtyC;
  let cleanC;
  let compC;
  let compCtx;
  let running = false;
  let lastP = -1;
  let time = 0;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    // offsetWidth statt getBoundingClientRect: die Bühne ist 3D-transformiert
    W = Math.round(canvas.offsetWidth * dpr);
    H = Math.round(canvas.offsetHeight * dpr);
    if (!W || !H) return;
    canvas.width = W;
    canvas.height = H;
    const tileW = Math.max(40, Math.min(110, W / 16));
    dirtyC = createCanvas(W, H);
    renderRoof(dirtyC.getContext('2d'), W, H, { dirty: true, seed: 21, tileW });
    cleanC = createCanvas(W, H);
    renderRoof(cleanC.getContext('2d'), W, H, { dirty: false, seed: 21, tileW });
    compC = createCanvas(W, H);
    compCtx = compC.getContext('2d');
    lastP = -1;
    draw();
  }

  function nozzle(p) {
    const lp = Math.min(p * LANES, LANES - 1e-6);
    const i = Math.floor(lp);
    const t = lp - i;
    const laneH = H / LANES;
    const pad = laneH * 0.6;
    const dir = i % 2 === 0 ? 1 : -1;
    const x = dir === 1 ? -pad + t * (W + pad * 2) : W + pad - t * (W + pad * 2);
    return { x, y: laneH * (i + 0.5), i, dir, laneH };
  }

  function drawMask(p) {
    compCtx.globalCompositeOperation = 'source-over';
    compCtx.clearRect(0, 0, W, H);
    if (p <= 0) return;
    compCtx.fillStyle = '#000';
    if (p >= 1) {
      compCtx.fillRect(0, 0, W, H);
    } else {
      const n = nozzle(p);
      const bleed = n.laneH * 0.08;
      compCtx.fillRect(0, 0, W, n.i * n.laneH + bleed);
      const top = n.i * n.laneH - bleed;
      const bh = n.laneH + bleed * 2;
      if (n.dir === 1) compCtx.fillRect(0, top, Math.max(0, n.x), bh);
      else compCtx.fillRect(n.x, top, W - n.x, bh);
      // Organische, "nasse" Kante
      for (let k = 0; k < 9; k++) {
        const yy = top + (bh / 8) * k;
        const wob = Math.sin(time * 6 + k * 1.7) * n.laneH * 0.06;
        compCtx.beginPath();
        compCtx.arc(n.x + wob * n.dir, yy, n.laneH * 0.2, 0, Math.PI * 2);
        compCtx.fill();
      }
    }
    compCtx.globalCompositeOperation = 'source-in';
    compCtx.drawImage(cleanC, 0, 0);
  }

  function emit(n) {
    const count = 7;
    for (let k = 0; k < count; k++) {
      const water = Math.random() > 0.28;
      const a = Math.random() * Math.PI * 2;
      const back = -n.dir * (1 + Math.random() * 3);
      const speed = (2 + Math.random() * 7) * dpr;
      particles.push({
        x: n.x,
        y: n.y + (Math.random() - 0.5) * n.laneH * 0.5,
        vx: Math.cos(a) * speed + back * dpr,
        vy: Math.sin(a) * speed,
        life: 1,
        decay: 0.015 + Math.random() * 0.03,
        r: (water ? 0.8 + Math.random() * 2.2 : 1 + Math.random() * 2.5) * dpr,
        water,
        hue: 80 + Math.random() * 30,
      });
    }
    if (particles.length > 700) particles.splice(0, particles.length - 700);
  }

  function draw() {
    if (!W || !dirtyC) return;
    const p = state.p;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(dirtyC, 0, 0);
    drawMask(p);
    ctx.drawImage(compC, 0, 0);

    const active = p > 0.001 && p < 0.999;
    if (active) {
      const n = nozzle(p);
      emit(n);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.laneH * 0.9);
      g.addColorStop(0, 'rgba(220,240,255,.32)');
      g.addColorStop(0.3, 'rgba(160,210,240,.08)');
      g.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(n.x - n.laneH, n.y - n.laneH, n.laneH * 2, n.laneH * 2);
    }

    for (let k = particles.length - 1; k >= 0; k--) {
      const pt = particles[k];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vx *= 0.94;
      pt.vy = pt.vy * 0.94 + 0.08 * dpr;
      pt.life -= pt.decay;
      if (pt.life <= 0) {
        particles.splice(k, 1);
        continue;
      }
      if (pt.water) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(190,230,255,${pt.life * 0.7})`;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `hsla(${pt.hue} 40% 22% / ${pt.life})`;
      }
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r * (0.6 + pt.life * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    lastP = p;
  }

  function loop(t) {
    if (!running) return;
    time = t / 1000;
    const active = state.p > 0.001 && state.p < 0.999;
    if (active || particles.length || state.p !== lastP) draw();
    requestAnimationFrame(loop);
  }

  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) requestAnimationFrame(loop);
  }

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: '+=380%',
      pin: true,
      scrub: 0.8,
      onToggle: (self) => setRunning(self.isActive),
    },
    // Timeline-Update statt ScrollTrigger-Update: läuft nach dem Scrub-Smoothing
    onUpdate: () => {
      meterValue.textContent = `${Math.round(state.p * 100)} %`;
      meterBar.style.transform = `scaleX(${state.p})`;
    },
  });

  tl.fromTo(stage, { rotationX: 52, scale: 1.25, yPercent: 10 }, { rotationX: 14, scale: 1, yPercent: 0, duration: 10 }, 0)
    .fromTo(caps[0], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1 }, 0.2)
    .to(caps[0], { autoAlpha: 0, y: -40, duration: 1 }, 2)
    .to(state, { p: 1, duration: 6 }, 2.4)
    .fromTo(caps[1], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1 }, 3)
    .to(caps[1], { autoAlpha: 0, y: -40, duration: 1 }, 6.6)
    .fromTo(caps[2], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1 }, 8.4)
    .fromTo('.clean-scene__meter', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 2.2)
    .to('.clean-scene__meter', { autoAlpha: 0, duration: 0.5 }, 9)
    .to({}, { duration: 1.5 });

  build();
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(build, 200);
  });
  ScrollTrigger.addEventListener('refresh', () => {
    if (Math.round(canvas.offsetWidth * dpr) !== W) build();
  });
}
