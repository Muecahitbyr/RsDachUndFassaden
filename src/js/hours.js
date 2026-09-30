import { company, dayNames } from '../data/company.js';

// Aktuelle Zeit in Deutschland – unabhängig von der Zeitzone des Besuchers.
function berlinNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

const toMin = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

export function openStatus() {
  const { day, minutes } = berlinNow();
  const today = company.hours[day];
  if (today && minutes >= toMin(today[0]) && minutes < toMin(today[1])) {
    return { open: true, text: `Jetzt geöffnet · bis ${today[1]} Uhr` };
  }
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = company.hours[d];
    if (!h) continue;
    if (i === 0 && minutes >= toMin(h[0])) continue;
    const when = i === 0 ? 'heute' : i === 1 ? 'morgen' : dayNames[d];
    return { open: false, text: `Geschlossen · öffnet ${when} um ${h[0]} Uhr` };
  }
  return { open: false, text: 'Geschlossen' };
}

export function initHours() {
  const { day } = berlinNow();
  const order = [1, 2, 3, 4, 5, 6, 0];

  document.querySelectorAll('[data-hours]').forEach((dl) => {
    dl.innerHTML = order
      .map((d) => {
        const h = company.hours[d];
        const cls = d === day ? ' class="is-today"' : '';
        return `<div${cls}><dt>${dayNames[d]}</dt><dd>${h ? `${h[0]} – ${h[1]}` : 'Geschlossen'}</dd></div>`;
      })
      .join('');
  });

  document.querySelectorAll('[data-week]').forEach((el) => {
    el.innerHTML = order
      .map((d) => {
        const h = company.hours[d];
        const cls = ['week__day', h ? 'is-open' : '', d === day ? 'is-today' : ''].join(' ');
        return `<span class="${cls}"><i></i>${dayNames[d].slice(0, 2)}</span>`;
      })
      .join('');
  });

  const update = () => {
    const s = openStatus();
    document.querySelectorAll('[data-open-status]').forEach((el) => {
      el.textContent = s.text;
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
    });
  };
  update();
  setInterval(update, 60_000);

  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
}
