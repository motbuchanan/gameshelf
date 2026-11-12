// Tiny sound effects, made with the Web Audio API (no sound files to download).
// Every sound answers something the player did or a die that landed. Nothing plays on its own,
// there is no music, and the Sound switch (or the speaker button) turns all of it off.
import { getSettings, setSettings } from './config.js';

let ctx = null, master = null, noiseBuf = null;

function on() { return getSettings().sound !== false; }

// Make (or wake) the audio context. iPads only allow this inside a tap, so unlock() runs on every press.
function ac() {
  if (!on()) return null;
  try {
    if (!ctx) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ctx = new A();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch (e) { return null; }
}

export function unlock() { ac(); }

// Small random pitch change so repeated sounds never sound like a machine gun.
const vary = (f, amt = 0.06) => f * (1 + (Math.random() * 2 - 1) * amt);

function tone(freq, dur, o = {}) {
  const a = ac(); if (!a) return;
  const t = a.currentTime + (o.delay || 0);
  const osc = a.createOscillator(), g = a.createGain();
  osc.type = o.type || 'square';
  osc.frequency.setValueAtTime(freq, t);
  if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq * o.slide), t + dur);
  const v = o.vol == null ? 0.12 : o.vol;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.012, dur / 4));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(master);
  osc.start(t); osc.stop(t + dur + 0.02);
}

function noise(dur, o = {}) {
  const a = ac(); if (!a || !noiseBuf) return;
  const t = a.currentTime + (o.delay || 0);
  const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  src.buffer = noiseBuf;
  f.type = o.filter || 'bandpass';
  f.frequency.setValueAtTime(o.freq || 2000, t);
  if (o.sweep) f.frequency.exponentialRampToValueAtTime(o.sweep, t + dur);
  f.Q.value = o.q || 1.2;
  const v = o.vol == null ? 0.2 : o.vol;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(master);
  src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
}

const notes = (list, step, o) => list.forEach((f, i) => tone(f, o.dur || 0.16, { ...o, delay: (o.delay || 0) + i * step }));

// A button press: a soft wooden tick.
export function tap() { noise(0.04, { freq: vary(1800, 0.1), q: 3, vol: 0.12 }); }

// Dice tumbling in the tray: little clicks until stop() is called, then one clack.
export function tumble() {
  if (!ac()) return () => {};
  let alive = true, timer = 0;
  const click = () => {
    if (!alive) return;
    noise(0.03, { freq: vary(2600, 0.25), q: 4, vol: 0.16 });
    timer = setTimeout(click, 55 + Math.random() * 110);
  };
  click();
  return () => { alive = false; clearTimeout(timer); land(); };
}
export function land() {
  noise(0.06, { freq: vary(1400), q: 2, vol: 0.28 });
  tone(vary(220), 0.07, { type: 'triangle', vol: 0.12 });
}

// What the roll turned out to be. Bigger results get bigger sounds.
export function tier(t) {
  if (t === 'legendary') {
    notes([523, 659, 784, 1047], 0.08, { type: 'square', vol: 0.1, dur: 0.18 });
    notes([1568, 2093], 0.06, { type: 'sine', vol: 0.08, dur: 0.3, delay: 0.34 });
  } else if (t === 'exceptional') {
    notes([587, 740, 880], 0.07, { type: 'square', vol: 0.1, dur: 0.16 });
  } else if (t === 'success') {
    notes([vary(660, 0.03), vary(880, 0.03)], 0.07, { type: 'square', vol: 0.09, dur: 0.12 });
  } else if (t === 'fail') {
    notes([330, 262], 0.1, { type: 'triangle', vol: 0.12, dur: 0.16 });
  } else if (t === 'disaster') {
    tone(400, 0.45, { type: 'triangle', vol: 0.14, slide: 0.35 });
  }
}

// Fight sounds.
export function hit(big) {
  noise(big ? 0.18 : 0.1, { filter: 'lowpass', freq: big ? 900 : 1300, vol: big ? 0.45 : 0.3 });
  tone(vary(big ? 140 : 190), big ? 0.18 : 0.1, { type: 'square', vol: 0.12, slide: 0.5 });
}
export function miss() { noise(0.22, { freq: 900, sweep: 3200, q: 0.8, vol: 0.14 }); }
export function heal() { notes([vary(784, 0.02), 988, 1175, 1568], 0.06, { type: 'sine', vol: 0.09, dur: 0.22 }); }
export function knockOut() { tone(520, 0.4, { type: 'square', vol: 0.09, slide: 0.3 }); noise(0.2, { filter: 'lowpass', freq: 600, vol: 0.25, delay: 0.32 }); }
export function calm() { notes([880, 1320], 0.12, { type: 'sine', vol: 0.1, dur: 0.4 }); }
export function coin() { notes([vary(988, 0.02), 1319], 0.07, { type: 'square', vol: 0.08, dur: 0.12 }); }
// A friend joins: a happy little two-step chirp.
export function cheer() { notes([659, 880, 1109], 0.07, { type: 'triangle', vol: 0.11, dur: 0.14 }); notes([1319, 1760], 0.09, { type: 'sine', vol: 0.08, dur: 0.22, delay: 0.24 }); }
// Something flies into the Big Book: a soft page flap.
export function whoosh() { noise(0.18, { freq: 900, sweep: 2600, q: 0.8, vol: 0.12 }); }
export function boom() { noise(0.35, { filter: 'lowpass', freq: 500, vol: 0.5 }); tone(90, 0.3, { type: 'square', vol: 0.12, slide: 0.5 }); }

// Level up and the end of a chapter.
export function levelUp() {
  notes([523, 659, 784], 0.1, { type: 'square', vol: 0.1, dur: 0.14 });
  notes([1047, 1047], 0.14, { type: 'square', vol: 0.11, dur: 0.24, delay: 0.32 });
}
export function fanfare() {
  notes([392, 523, 659, 784], 0.12, { type: 'square', vol: 0.1, dur: 0.18 });
  notes([659, 784, 1047], 0.1, { type: 'square', vol: 0.1, dur: 0.3, delay: 0.55 });
  notes([1568, 2093, 2637], 0.07, { type: 'sine', vol: 0.06, dur: 0.4, delay: 0.85 });
}

export function isOn() { return on(); }
export function setOn(v) {
  setSettings({ sound: !!v });
  if (v) { ac(); tap(); }
  else if (ctx) { try { ctx.suspend(); } catch (e) { /* already quiet */ } }   // cut off anything still ringing
}

// Screen shake: small, only for big moments, off when the device asks for less motion or the switch is off.
export function shakeOK() {
  if (getSettings().shake === false) return false;
  try { return !window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; }
}
export function shake(el, big) {
  if (!el || !shakeOK()) return;
  el.classList.remove('shake', 'shake-big');
  void el.offsetWidth;   // restart the animation
  el.classList.add(big ? 'shake-big' : 'shake');
  setTimeout(() => el.classList.remove('shake', 'shake-big'), 450);
}

export default { unlock, tap, tumble, land, tier, hit, miss, heal, knockOut, calm, coin, cheer, whoosh, boom, levelUp, fanfare, isOn, setOn, shakeOK, shake };
