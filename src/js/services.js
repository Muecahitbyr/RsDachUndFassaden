import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { coverCanvas, grime, loadImage } from './photo.js';

// Mini-Vorher/Nachher auf den Leistungskarten: die Reinigung "wischt" über das Bild.
class Wipe {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.kind = canvas.dataset.wipe;
    this.src = canvas.dataset.img;
    this.seed = Number(canvas.dataset.seed || 1);
    this.p = 0;
    this.build();
  }

  async build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(this.canvas.offsetWidth * dpr);
    const h = Math.round(this.canvas.offsetHeight * dpr);
    if (!w || !h || w === this.canvas.width) return this.draw();
    const img = await loadImage(this.src);
    this.canvas.width = w;
    this.canvas.height = h;
    this.clean = coverCanvas(img, w, h);
    this.dirty = grime(this.clean, this.kind, this.seed);
    this.draw();
  }

  set(p) {
    this.p = p;
    this.draw();
  }

  draw() {
    const { ctx, canvas, p } = this;
    if (!this.dirty) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.drawImage(this.dirty, 0, 0);
    // Diagonale Wischkante
    const x = -h * 0.4 + p * (w + h * 0.8);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x + h * 0.2, 0);
    ctx.lineTo(x - h * 0.2, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(this.clean, 0, 0);
    ctx.restore();
    if (p > 0 && p < 1) {
      const g = ctx.createLinearGradient(x - h * 0.12, 0, x + h * 0.12, 0);
      g.addColorStop(0, 'rgba(160,220,255,0)');
      g.addColorStop(0.5, 'rgba(230,245,255,.35)');
      g.addColorStop(1, 'rgba(160,220,255,0)');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = g;
      ctx.lineWidth = h * 0.03;
      ctx.beginPath();
      ctx.moveTo(x + h * 0.2, 0);
      ctx.lineTo(x - h * 0.2, h);
      ctx.stroke();
      ctx.restore();
    }
  }
}

export function initServices() {
  const section = document.querySelector('.services');
  if (!section) return;
  const pin = section.querySelector('.services__pin');
  const track = section.querySelector('.services__track');
  const viewport = section.querySelector('.services__viewport');
  const bar = section.querySelector('.services__progress span');
  const cards = [...track.querySelectorAll('.service-card')];
  const wipes = [...track.querySelectorAll('canvas[data-wipe]')].map((c) => new Wipe(c));

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => wipes.forEach((w) => w.build()), 200);
  });

  const mm = gsap.matchMedia();

  mm.add('(min-width: 900px)', () => {
    const distance = () => track.scrollWidth - viewport.clientWidth;
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => (bar.style.transform = `scaleX(${self.progress})`),
      },
    });

    cards.forEach((card) => {
      const visual = card.querySelector('.service-card__visual');
      if (visual) {
        gsap.fromTo(
          visual.children[0],
          { xPercent: -8, scale: 1.2 },
          {
            xPercent: 8,
            scale: 1.2,
            ease: 'none',
            scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          },
        );
      }
      gsap.from(card, {
        rotationY: -18,
        z: -120,
        opacity: 0.3,
        transformPerspective: 1200,
        transformOrigin: 'left center',
        ease: 'power2.out',
        scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 100%', end: 'left 55%', scrub: true },
      });
      const canvas = card.querySelector('canvas[data-wipe]');
      if (canvas) {
        const wipe = wipes.find((w) => w.canvas === canvas);
        ScrollTrigger.create({
          trigger: card,
          containerAnimation: tween,
          start: 'left 75%',
          end: 'right 55%',
          onUpdate: (self) => wipe.set(self.progress),
        });
      }
    });
    return () => gsap.set(track, { x: 0 });
  });

  mm.add('(max-width: 899px)', () => {
    // Mobil: native Wischgeste, Karten reinigen sich beim Sichtbarwerden
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const wipe = wipes.find((w) => w.canvas === e.target);
          if (e.isIntersecting) gsap.to(wipe, { p: 1, duration: 1.8, ease: 'power2.inOut', onUpdate: () => wipe.draw() });
        });
      },
      { threshold: 0.6 },
    );
    wipes.forEach((w) => io.observe(w.canvas));
    const onScroll = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      bar.style.transform = `scaleX(${max ? viewport.scrollLeft / max : 0})`;
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      viewport.removeEventListener('scroll', onScroll);
    };
  });
}
