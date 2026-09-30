// Prozedurale Texturen: Dach, Fassade und Solaranlage – jeweils "dirty" und "clean".
// Geometrie nutzt einen eigenen Seed, damit Vorher/Nachher exakt deckungsgleich sind.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

const blob = (ctx, x, y, r, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

function radial(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace('A', alpha));
  g.addColorStop(1, color.replace('A', 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/* ---------------------------------------------------------------- Dach */

function tilePath(ctx, x, top, yb, tw) {
  const c = tw * 0.36;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, yb - c);
  ctx.quadraticCurveTo(x, yb, x + tw / 2, yb);
  ctx.quadraticCurveTo(x + tw, yb, x + tw, yb - c);
  ctx.lineTo(x + tw, top);
  ctx.closePath();
}

function moss(ctx, rnd, cx, cy, size) {
  const n = 5 + Math.floor(rnd() * 9);
  for (let i = 0; i < n; i++) {
    const x = cx + (rnd() - 0.5) * size * 2.2;
    const y = cy + (rnd() - 0.6) * size * 0.9;
    const r = size * (0.25 + rnd() * 0.45);
    blob(ctx, x, y, r, `hsl(${70 + rnd() * 22} ${22 + rnd() * 16}% ${14 + rnd() * 11}%)`);
  }
  for (let i = 0; i < n; i++) {
    const x = cx + (rnd() - 0.5) * size * 2;
    const y = cy + (rnd() - 0.7) * size * 0.8;
    blob(ctx, x, y, size * (0.08 + rnd() * 0.16), `hsla(${75 + rnd() * 20} 32% ${28 + rnd() * 10}% / .8)`);
  }
}

export function renderRoof(ctx, w, h, { dirty = false, seed = 7, tileW } = {}) {
  const geo = mulberry32(seed);
  const dirt = mulberry32(seed * 977 + 13);
  const grain = mulberry32(seed * 53 + 1);
  const tw = tileW ?? Math.max(18, Math.min(120, w / 20));
  const rowH = tw * 0.6;
  const len = tw * 1.9;
  const rows = Math.ceil(h / rowH) + 3;
  const cols = Math.ceil(w / tw) + 2;

  ctx.save();
  ctx.fillStyle = dirty ? '#16150f' : '#2a120a';
  ctx.fillRect(0, 0, w, h);

  for (let r = rows - 1; r >= 0; r--) {
    const yb = r * rowH;
    const off = (r % 2) * (tw / 2) + tw / 2;
    for (let c = 0; c < cols; c++) {
      const hue = 11 + geo() * 9;
      const sat = 38 + geo() * 14;
      const lig = 31 + geo() * 12;
      const x = c * tw - off + (geo() - 0.5) * tw * 0.03;
      const y = yb + (geo() - 0.5) * tw * 0.04;

      const l = dirty ? lig * 0.5 : lig;
      const s = dirty ? sat * 0.25 : sat;
      const hh = dirty ? hue + 30 : hue;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.55)';
      ctx.shadowBlur = tw * 0.16;
      ctx.shadowOffsetY = tw * 0.07;
      tilePath(ctx, x + tw * 0.02, y - len, y, tw * 0.96);
      const g = ctx.createLinearGradient(0, y - rowH * 1.2, 0, y);
      g.addColorStop(0, `hsl(${hh} ${s}% ${l - 9}%)`);
      g.addColorStop(0.7, `hsl(${hh} ${s}% ${l}%)`);
      g.addColorStop(1, `hsl(${hh} ${s}% ${l + (dirty ? 2 : 6)}%)`);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();

      if (!dirty) {
        // Feine Kante + Tonkörnung statt Plastikglanz
        ctx.strokeStyle = `hsla(${hue} 60% 70% / .12)`;
        ctx.lineWidth = Math.max(1, tw * 0.02);
        ctx.beginPath();
        ctx.moveTo(x + tw * 0.08, y - tw * 0.3);
        ctx.quadraticCurveTo(x + tw * 0.08, y - tw * 0.04, x + tw / 2, y - tw * 0.04);
        ctx.stroke();
        const specks = 6 + Math.floor(grain() * 8);
        for (let i = 0; i < specks; i++) {
          ctx.fillStyle = grain() > 0.5 ? 'rgba(0,0,0,.14)' : 'rgba(255,220,200,.08)';
          ctx.fillRect(x + tw * (0.1 + grain() * 0.8), y - rowH * (0.1 + grain() * 0.85), tw * 0.03, tw * 0.03);
        }
      } else {
        // Schwärzung, Flechten und Moospolster an der Unterkante
        if (dirt() < 0.7) {
          const sg = ctx.createLinearGradient(0, y - rowH, 0, y);
          sg.addColorStop(0, 'rgba(10,12,6,0)');
          sg.addColorStop(1, `rgba(10,12,6,${0.2 + dirt() * 0.35})`);
          ctx.fillStyle = sg;
          tilePath(ctx, x + tw * 0.02, y - rowH, y, tw * 0.96);
          ctx.fill();
        }
        const spots = Math.floor(dirt() * 5);
        for (let i = 0; i < spots; i++) {
          blob(
            ctx,
            x + tw * (0.15 + dirt() * 0.7),
            y - rowH * (0.15 + dirt() * 0.8),
            tw * (0.02 + dirt() * 0.045),
            `hsla(${55 + dirt() * 30} 12% ${52 + dirt() * 18}% / ${0.2 + dirt() * 0.3})`,
          );
        }
        if (dirt() < 0.62) moss(ctx, dirt, x + tw * (0.25 + dirt() * 0.5), y - tw * 0.05, tw * (0.12 + dirt() * 0.14));
      }
    }
  }

  if (dirty) {
    const n = Math.round((w * h) / 60000) + 8;
    for (let i = 0; i < n; i++) {
      radial(ctx, dirt() * w, dirt() * h, (0.08 + dirt() * 0.25) * Math.max(w, h), 'rgba(18,24,10,A)', 0.25 + dirt() * 0.3);
    }
    for (let i = 0; i < n / 2; i++) {
      radial(ctx, dirt() * w, dirt() * h, (0.05 + dirt() * 0.15) * Math.max(w, h), 'rgba(70,95,30,A)', 0.12 + dirt() * 0.2);
    }
  } else {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.45, 'rgba(255,240,230,.04)');
    g.addColorStop(0.55, 'rgba(255,240,230,.06)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

/* ------------------------------------------------------------- Fassade */

export function renderFacade(ctx, w, h, { dirty = false, seed = 4 } = {}) {
  const geo = mulberry32(seed);
  const dirt = mulberry32(seed * 131 + 7);
  const u = Math.min(w, h);

  ctx.save();
  ctx.fillStyle = dirty ? '#c9c4b5' : '#efe9e0';
  ctx.fillRect(0, 0, w, h);

  // Putzstruktur
  const grains = Math.round((w * h) / 90);
  for (let i = 0; i < grains; i++) {
    const x = geo() * w;
    const y = geo() * h;
    const a = geo() * 0.08;
    ctx.fillStyle = geo() > 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * 1.5})`;
    ctx.fillRect(x, y, 1 + geo() * u * 0.004, 1 + geo() * u * 0.004);
  }

  // Dachüberstand
  const eave = h * 0.1;
  ctx.fillStyle = dirty ? '#3b2a20' : '#5a3021';
  ctx.fillRect(0, 0, w, eave * 0.55);
  const es = ctx.createLinearGradient(0, eave * 0.55, 0, eave * 1.6);
  es.addColorStop(0, 'rgba(0,0,0,.35)');
  es.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = es;
  ctx.fillRect(0, eave * 0.55, w, eave);

  // Sockel
  const plinth = h * 0.12;
  ctx.fillStyle = dirty ? '#8d877a' : '#b9b3a8';
  ctx.fillRect(0, h - plinth, w, plinth);
  ctx.fillStyle = 'rgba(0,0,0,.12)';
  ctx.fillRect(0, h - plinth, w, Math.max(2, u * 0.006));

  // Fenster
  const cols = w > h * 1.1 ? 3 : 2;
  const rowsN = 2;
  const ww = (w / cols) * 0.42;
  const wh = ww * 1.25;
  const usableTop = eave * 1.8;
  const usableH = h - plinth - usableTop;
  const windows = [];
  for (let r = 0; r < rowsN; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = (w / cols) * (c + 0.5);
      const cy = usableTop + (usableH / rowsN) * (r + 0.45);
      windows.push({ x: cx - ww / 2, y: cy - wh / 2, w: ww, h: wh });
    }
  }
  const fr = Math.max(2, ww * 0.06);
  windows.forEach((win) => {
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.fillRect(win.x - fr * 0.6, win.y - fr * 0.6, win.w + fr * 1.2, win.h + fr * 1.2);
    ctx.fillStyle = dirty ? '#dcd9d0' : '#fbfbf9';
    ctx.fillRect(win.x, win.y, win.w, win.h);
    const gx = win.x + fr;
    const gy = win.y + fr;
    const gw = win.w - fr * 2;
    const gh = win.h - fr * 2;
    const glass = ctx.createLinearGradient(gx, gy, gx + gw, gy + gh);
    glass.addColorStop(0, dirty ? '#39434a' : '#4b6b86');
    glass.addColorStop(0.45, dirty ? '#262d33' : '#1f3346');
    glass.addColorStop(0.5, dirty ? '#48525a' : '#8fb3cf');
    glass.addColorStop(0.56, dirty ? '#262d33' : '#1f3346');
    glass.addColorStop(1, dirty ? '#1b2126' : '#142333');
    ctx.fillStyle = glass;
    ctx.fillRect(gx, gy, gw, gh);
    ctx.fillStyle = dirty ? '#dcd9d0' : '#fbfbf9';
    ctx.fillRect(gx + gw / 2 - fr / 2, gy, fr, gh);
    ctx.fillRect(gx, gy + gh * 0.38 - fr / 2, gw, fr);
    // Fensterbank
    ctx.fillStyle = dirty ? '#9b978c' : '#d6d3cc';
    ctx.fillRect(win.x - fr * 1.5, win.y + win.h, win.w + fr * 3, fr * 1.3);
    const ss = ctx.createLinearGradient(0, win.y + win.h + fr * 1.3, 0, win.y + win.h + fr * 4);
    ss.addColorStop(0, 'rgba(0,0,0,.18)');
    ss.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ss;
    ctx.fillRect(win.x - fr * 1.5, win.y + win.h + fr * 1.3, win.w + fr * 3, fr * 3);
  });

  if (dirty) {
    ctx.fillStyle = 'rgba(80,90,60,.14)';
    ctx.fillRect(0, 0, w, h);
    // Algenläufer unter den Fensterbänken
    windows.forEach((win) => {
      [win.x - fr, win.x + win.w + fr, win.x + win.w * (0.3 + dirt() * 0.4)].forEach((sx, i) => {
        const len = u * (0.18 + dirt() * 0.28);
        const sw = u * (i === 2 ? 0.08 : 0.022 + dirt() * 0.02);
        const top = win.y + win.h + fr * 1.3;
        const g = ctx.createLinearGradient(0, top, 0, top + len);
        g.addColorStop(0, `rgba(58,78,40,${i === 2 ? 0.28 : 0.6})`);
        g.addColorStop(1, 'rgba(58,78,40,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(sx - sw / 2, top);
        ctx.lineTo(sx + sw / 2, top);
        ctx.lineTo(sx + sw * 0.2, top + len);
        ctx.lineTo(sx - sw * 0.2, top + len);
        ctx.fill();
      });
    });
    // Grünbelag unter dem Dachüberstand
    const eg = ctx.createLinearGradient(0, eave * 0.55, 0, eave * 2.4);
    eg.addColorStop(0, 'rgba(50,70,35,.55)');
    eg.addColorStop(1, 'rgba(50,70,35,0)');
    ctx.fillStyle = eg;
    ctx.fillRect(0, eave * 0.55, w, eave * 1.9);
    for (let i = 0; i < w / (u * 0.03); i++) {
      const x = dirt() * w;
      const len = u * (0.05 + dirt() * 0.18);
      const g = ctx.createLinearGradient(0, eave, 0, eave + len);
      g.addColorStop(0, 'rgba(45,62,30,.45)');
      g.addColorStop(1, 'rgba(45,62,30,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, eave, u * (0.004 + dirt() * 0.01), len);
    }
    // Spritzwasserzone
    const pg = ctx.createLinearGradient(0, h, 0, h - plinth * 2.2);
    pg.addColorStop(0, 'rgba(55,50,35,.6)');
    pg.addColorStop(1, 'rgba(55,50,35,0)');
    ctx.fillStyle = pg;
    ctx.fillRect(0, h - plinth * 2.2, w, plinth * 2.2);
    // Flecken
    for (let i = 0; i < 14; i++) {
      const edge = dirt() < 0.5;
      const x = edge ? (dirt() < 0.5 ? dirt() * w * 0.15 : w - dirt() * w * 0.15) : dirt() * w;
      radial(ctx, x, dirt() * h, u * (0.08 + dirt() * 0.2), 'rgba(70,95,45,A)', 0.12 + dirt() * 0.2);
    }
  } else {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,.12)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

/* --------------------------------------------------------------- Solar */

export function renderSolar(ctx, w, h, { dirty = false, seed = 5 } = {}) {
  const geo = mulberry32(seed);
  const dirt = mulberry32(seed * 71 + 3);
  renderRoof(ctx, w, h, { dirty, seed: seed + 100, tileW: Math.max(14, w / 26) });

  const u = Math.min(w, h);
  const m = u * 0.08;
  const cols = w > h ? 4 : 2;
  const rowsN = 2;
  const gap = u * 0.018;
  const pw = (w - m * 2 - gap * (cols - 1)) / cols;
  const ph = (h - m * 2 - gap * (rowsN - 1)) / rowsN;
  const frame = Math.max(2, u * 0.012);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.6)';
  ctx.shadowBlur = u * 0.04;
  ctx.shadowOffsetY = u * 0.015;
  ctx.fillStyle = '#000';
  ctx.fillRect(m, m, w - m * 2, h - m * 2);
  ctx.restore();

  for (let r = 0; r < rowsN; r++) {
    for (let c = 0; c < cols; c++) {
      const x = m + c * (pw + gap);
      const y = m + r * (ph + gap);
      const fg = ctx.createLinearGradient(x, y, x + pw, y + ph);
      fg.addColorStop(0, dirty ? '#8f8e87' : '#e3e6ea');
      fg.addColorStop(1, dirty ? '#5d5c55' : '#9aa1ab');
      ctx.fillStyle = fg;
      ctx.fillRect(x, y, pw, ph);

      const ix = x + frame;
      const iy = y + frame;
      const iw = pw - frame * 2;
      const ih = ph - frame * 2;
      const cellCols = 6;
      const cellRows = Math.max(6, Math.round((ih / iw) * cellCols));
      const cw = iw / cellCols;
      const ch = ih / cellRows;
      for (let cy = 0; cy < cellRows; cy++) {
        for (let cx = 0; cx < cellCols; cx++) {
          const l = 14 + geo() * 5;
          ctx.fillStyle = dirty ? `hsl(215 25% ${l * 0.9}%)` : `hsl(218 70% ${l}%)`;
          ctx.fillRect(ix + cx * cw + 0.5, iy + cy * ch + 0.5, cw - 1, ch - 1);
        }
      }
      ctx.strokeStyle = dirty ? 'rgba(160,160,150,.25)' : 'rgba(190,210,240,.35)';
      ctx.lineWidth = Math.max(0.5, u * 0.0015);
      for (let cx = 0; cx < cellCols; cx++) {
        for (let k = 1; k <= 2; k++) {
          const lx = ix + cx * cw + (cw * k) / 3;
          ctx.beginPath();
          ctx.moveTo(lx, iy);
          ctx.lineTo(lx, iy + ih);
          ctx.stroke();
        }
      }

      const rg = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
      rg.addColorStop(0, 'rgba(255,255,255,0)');
      rg.addColorStop(0.35, `rgba(200,225,255,${dirty ? 0.04 : 0.22})`);
      rg.addColorStop(0.5, 'rgba(255,255,255,0)');
      rg.addColorStop(0.7, `rgba(200,225,255,${dirty ? 0.02 : 0.1})`);
      rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(ix, iy, iw, ih);

      if (dirty) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(ix, iy, iw, ih);
        ctx.clip();
        ctx.fillStyle = 'rgba(150,130,85,.28)';
        ctx.fillRect(ix, iy, iw, ih);
        for (let i = 0; i < 6; i++) {
          radial(ctx, ix + dirt() * iw, iy + dirt() * ih, u * (0.06 + dirt() * 0.14), 'rgba(135,115,70,A)', 0.2 + dirt() * 0.3);
        }
        const bg = ctx.createLinearGradient(0, iy + ih, 0, iy + ih * 0.7);
        bg.addColorStop(0, 'rgba(95,85,50,.75)');
        bg.addColorStop(1, 'rgba(95,85,50,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(ix, iy + ih * 0.7, iw, ih * 0.3);
        for (let i = 0; i < 2 + Math.floor(dirt() * 3); i++) {
          const dx = ix + dirt() * iw;
          const dy = iy + dirt() * ih * 0.8;
          const s = u * (0.008 + dirt() * 0.012);
          for (let k = 0; k < 6; k++) {
            blob(ctx, dx + (dirt() - 0.5) * s * 2.5, dy + (dirt() - 0.3) * s * 2.5, s * (0.4 + dirt() * 0.8), 'rgba(235,232,220,.85)');
          }
          blob(ctx, dx, dy, s * 0.5, 'rgba(90,90,80,.6)');
        }
        ctx.restore();
        for (let i = 0; i < iw / (u * 0.03); i++) {
          moss(ctx, dirt, ix + dirt() * iw, iy + ih + frame * 0.3, u * (0.006 + dirt() * 0.01));
        }
      }
    }
  }
}

const renderers = { roof: renderRoof, facade: renderFacade, solar: renderSolar };

export function renderTexture(kind, w, h, dirty, seed) {
  const c = createCanvas(w, h);
  renderers[kind](c.getContext('2d'), c.width, c.height, { dirty, seed });
  return c;
}
