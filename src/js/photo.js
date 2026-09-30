// Fotos laden, formatfüllend zeichnen und daraus einen realistischen "Vorher"-Zustand erzeugen.
// Der Schmutz entsteht aus fraktalem Rauschen (fBm) – so wirken Moos, Algen und Schleier natürlich.

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

const images = new Map();
export function loadImage(src) {
  if (!images.has(src)) {
    images.set(
      src,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      }),
    );
  }
  return images.get(src);
}

// Wie object-fit: cover, mit optionalem Fokuspunkt (0–1)
export function coverCanvas(img, w, h, fx = 0.5, fy = 0.5) {
  const c = createCanvas(w, h);
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (w - dw) * fx, (h - dh) * fy, dw, dh);
  return c;
}

function noiseField(w, h, cell, octaves, seed) {
  const out = new Float32Array(w * h);
  const rnd = mulberry32(seed);
  let amp = 1;
  let total = 0;
  let c = cell;
  for (let o = 0; o < octaves && c >= 1; o++) {
    const gw = Math.ceil(w / c) + 2;
    const gh = Math.ceil(h / c) + 2;
    const grid = new Float32Array(gw * gh);
    for (let i = 0; i < grid.length; i++) grid[i] = rnd();
    for (let y = 0; y < h; y++) {
      const fy = y / c;
      const y0 = fy | 0;
      const ty = fy - y0;
      const sy = ty * ty * (3 - 2 * ty);
      const row = y0 * gw;
      for (let x = 0; x < w; x++) {
        const fx = x / c;
        const x0 = fx | 0;
        const tx = fx - x0;
        const sx = tx * tx * (3 - 2 * tx);
        const i0 = row + x0;
        const top = grid[i0] + (grid[i0 + 1] - grid[i0]) * sx;
        const bot = grid[i0 + gw] + (grid[i0 + gw + 1] - grid[i0 + gw]) * sx;
        out[y * w + x] += amp * (top + (bot - top) * sy);
      }
    }
    total += amp;
    amp *= 0.5;
    c /= 2;
  }
  for (let i = 0; i < out.length; i++) {
    const v = (out[i] / total - 0.5) * 2.2 + 0.5; // Kontrast strecken
    out[i] = v < 0 ? 0 : v > 1 ? 1 : v;
  }
  return out;
}

const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function paintLayer(w, h, fn) {
  const c = createCanvas(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let i = 0, j = 0; i < w * h; i++, j += 4) fn(i, d, j);
  ctx.putImageData(img, 0, 0);
  return c;
}

const PROFILES = {
  roof: { desat: 0.6, veil: [52, 56, 40], veilAlpha: [0.35, 0.8], moss: 1, lichen: 1, darken: 0.12, streaks: 'roof' },
  facade: { desat: 0.35, veil: [118, 124, 96], veilAlpha: [0.15, 0.6], moss: 0.3, lichen: 0, darken: 0.04, streaks: 'facade' },
  solar: { desat: 0.35, dust: [160, 146, 112], veilAlpha: [0.15, 0.55], moss: 0.2, lichen: 0, darken: 0.05, specks: true },
};

// Erzeugt aus einem sauberen Bild die verschmutzte Variante
export function grime(src, kind = 'roof', seed = 1) {
  const p = PROFILES[kind] || PROFILES.roof;
  const W = src.width;
  const H = src.height;
  const u = Math.max(W, H);
  const out = createCanvas(W, H);
  const ctx = out.getContext('2d');
  const rnd = mulberry32(seed * 131 + 7);
  ctx.drawImage(src, 0, 0);

  // 1. Farben verblassen
  ctx.globalCompositeOperation = 'saturation';
  ctx.globalAlpha = p.desat;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  // 2. Großflächiger Schleier aus Schmutz, Algen oder Staub
  const s1 = 4;
  const lw = Math.ceil(W / s1);
  const lh = Math.ceil(H / s1);
  const n1 = noiseField(lw, lh, Math.max(lw, lh) / 4, 5, seed);
  const [a0, a1] = p.veilAlpha;
  const col = p.dust || p.veil;
  const veil = paintLayer(lw, lh, (i, d, j) => {
    d[j] = col[0];
    d[j + 1] = col[1];
    d[j + 2] = col[2];
    d[j + 3] = (a0 + (a1 - a0) * n1[i]) * 255;
  });
  ctx.globalCompositeOperation = p.dust ? 'source-over' : 'multiply';
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(veil, 0, 0, W, H);

  // 3. Moos- und Algenpolster – bevorzugt in Fugen und Überlappungen (dunkle Bildstellen)
  if (p.moss) {
    const s2 = 2;
    const mw = Math.ceil(W / s2);
    const mh = Math.ceil(H / s2);
    const n2 = noiseField(mw, mh, Math.max(3, mw / 150), 4, seed + 11);
    const n3 = noiseField(mw, mh, Math.max(2, mw / 400), 2, seed + 23);
    const small = createCanvas(mw, mh);
    const sctx = small.getContext('2d');
    sctx.drawImage(src, 0, 0, mw, mh);
    const px = sctx.getImageData(0, 0, mw, mh).data;
    const mossLayer = paintLayer(mw, mh, (i, d, j) => {
      const x = (i % mw) / mw;
      const y = ((i / mw) | 0) / mh;
      const patch = n1[((y * lh) | 0) * lw + ((x * lw) | 0)];
      const lum = (px[j] * 0.3 + px[j + 1] * 0.59 + px[j + 2] * 0.11) / 255;
      const shadow = smooth(0.15, 0.75, 1 - lum);
      const grow = smooth(0.5, 0.72, n2[i] * 0.45 + patch * 0.55);
      const m = grow * (0.25 + 0.75 * shadow) * (0.55 + 0.45 * n3[i]) * p.moss;
      const t = n2[i] * 0.6 + n3[i] * 0.4;
      d[j] = 46 + t * 42;
      d[j + 1] = 52 + t * 46;
      d[j + 2] = 26 + t * 18;
      d[j + 3] = m * 215;
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(mossLayer, 0, 0, W, H);

    // 4. Flechten – kleine, helle Flecken dort, wo es ohnehin schmutzig ist
    if (p.lichen) {
      const count = Math.round((W * H) / 2200);
      const r0 = u / 1500;
      for (let k = 0; k < count; k++) {
        const x = rnd() * W;
        const y = rnd() * H;
        if (n1[((y / s1) | 0) * lw + ((x / s1) | 0)] < 0.45) continue;
        ctx.fillStyle = `rgba(${190 + rnd() * 30},${186 + rnd() * 26},${150 + rnd() * 20},${0.25 + rnd() * 0.35})`;
        ctx.beginPath();
        ctx.arc(x, y, r0 * (0.6 + rnd() * 1.8), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 5. Läufer: auf einer grob aufgelösten Ebene gezeichnet und hochskaliert – dadurch weich wie echte Ablaufspuren
  if (p.streaks) {
    const sc = 6;
    const layer = createCanvas(W / sc, H / sc);
    const lc = layer.getContext('2d');
    const roof = p.streaks === 'roof';
    const n = Math.round(W / (roof ? 16 : 24));
    const rgb = roof ? '30,32,24' : '58,70,44';
    for (let k = 0; k < n; k++) {
      const x = (rnd() * W) / sc;
      const y = (rnd() * H * (roof ? 0.6 : 0.75)) / sc;
      const len = (H * (roof ? 0.2 + rnd() * 0.5 : 0.08 + rnd() * 0.3)) / sc;
      const sw = Math.max(1, (u * (0.004 + rnd() * (roof ? 0.02 : 0.012))) / sc);
      const a = roof ? 0.12 + rnd() * 0.2 : 0.2 + rnd() * 0.3;
      const g = lc.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, `rgba(${rgb},${roof ? 0 : a})`);
      g.addColorStop(0.3, `rgba(${rgb},${a})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      lc.fillStyle = g;
      lc.beginPath();
      lc.moveTo(x - sw / 2, y);
      lc.lineTo(x + sw / 2, y);
      lc.lineTo(x + sw * 0.15, y + len);
      lc.lineTo(x - sw * 0.15, y + len);
      lc.fill();
    }
    if (!roof) {
      const g = lc.createLinearGradient(0, H / sc, 0, (H * 0.78) / sc);
      g.addColorStop(0, 'rgba(70,64,48,.55)');
      g.addColorStop(1, 'rgba(70,64,48,0)');
      lc.fillStyle = g;
      lc.fillRect(0, (H * 0.78) / sc, W / sc, (H * 0.22) / sc);
    }
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(layer, 0, 0, W, H);
  }

  // 6. Feiner Staub und Pollen auf PV-Modulen
  if (p.specks) {
    ctx.globalCompositeOperation = 'source-over';
    const count = Math.round((W * H) / 350);
    const r0 = u / 2200;
    for (let k = 0; k < count; k++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const v = n1[((y / s1) | 0) * lw + ((x / s1) | 0)];
      if (rnd() > v) continue;
      ctx.fillStyle = `rgba(${200 + rnd() * 40},${190 + rnd() * 40},${150 + rnd() * 40},${0.1 + rnd() * 0.25})`;
      ctx.fillRect(x, y, r0 * (0.8 + rnd() * 2), r0 * (0.8 + rnd() * 2));
    }
  }

  // 7. Gesamtbild etwas dunkler und matter
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgba(10,12,6,${p.darken})`;
  ctx.fillRect(0, 0, W, H);
  return out;
}
