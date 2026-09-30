import { renderTexture } from './textures.js';

// Rendert statische Texturen für <canvas data-texture="roof|facade|solar" data-seed="…">.
export function initStaticTextures() {
  const canvases = [...document.querySelectorAll('canvas[data-texture]')];
  const draw = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvases.forEach((c) => {
      const w = Math.round(c.offsetWidth * dpr);
      const h = Math.round(c.offsetHeight * dpr);
      if (!w || !h || w === c.width) return;
      const src = renderTexture(c.dataset.texture, w, h, c.dataset.state === 'dirty', Number(c.dataset.seed || 1));
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(src, 0, 0);
    });
  };
  draw();
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(draw, 200);
  });
}
