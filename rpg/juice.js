// Small "feel" helpers for screens built from HTML (v1.7): numbers that count up, star bursts,
// things that fly to the Big Book, and quick pops. With "reduce motion" on, everything just
// appears at its final state; sounds and words stay the same.
import I from './icons.js';

export function still() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
}

// Count a number from `from` to `to` inside el (coins, XP numbers).
const counting = new WeakMap();
export function countUp(el, from, to, ms = 650, fmt = n => String(n)) {
  if (!el) return;
  cancelAnimationFrame(counting.get(el) || 0);
  if (still() || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(Math.round(from + (to - from) * e));
    if (k < 1) counting.set(el, requestAnimationFrame(step));
    else { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  };
  counting.set(el, requestAnimationFrame(step));
}

// A ring of little stars bursting out of the middle of an element.
export function starBurst(el, n = 10) {
  if (!el || still()) return;
  const r = el.getBoundingClientRect(); if (!r.width) return;
  const box = document.createElement('div');
  box.className = 'starburst';
  box.style.left = (r.left + r.width / 2) + 'px'; box.style.top = (r.top + r.height / 2) + 'px';
  const reach = Math.max(50, Math.min(150, r.width * 0.55));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, d = reach * (0.7 + Math.random() * 0.4);
    const s = document.createElement('span');
    s.style.setProperty('--x', Math.round(Math.cos(a) * d) + 'px');
    s.style.setProperty('--y', Math.round(Math.sin(a) * d) + 'px');
    s.style.animationDelay = (Math.random() * 80) + 'ms';
    s.innerHTML = I.icon('star', 18 + (i % 3) * 4);
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 1000);
}

// Something (an icon) flies from one element to another, then the target wiggles.
export function flyTo(fromEl, toEl, html) {
  if (!toEl) return;
  const wiggle = () => { toEl.classList.remove('wiggle'); void toEl.offsetWidth; toEl.classList.add('wiggle'); setTimeout(() => toEl.classList.remove('wiggle'), 700); };
  const to = toEl.getBoundingClientRect();
  if (still() || !to.width || !fromEl) { wiggle(); return; }
  const from = fromEl.getBoundingClientRect();
  const fly = document.createElement('div');
  fly.className = 'flyer';
  fly.innerHTML = html;
  const x0 = from.left + from.width / 2, y0 = from.top + from.height / 2;
  fly.style.left = x0 + 'px'; fly.style.top = y0 + 'px';
  document.body.appendChild(fly);
  const dx = to.left + to.width / 2 - x0, dy = to.top + to.height / 2 - y0;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fly.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.45)`;
    fly.style.opacity = '0.85';
  }));
  setTimeout(() => { fly.remove(); wiggle(); }, 720);
}

// Replay a CSS pop on an element.
export function pop(el, cls = 'pop-in') {
  if (!el) return;
  el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
}

export default { still, countUp, starBurst, flyTo, pop };
