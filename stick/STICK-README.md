# STICK v0.4 · Nov 12 2026 — count voice fix

Upload INTO the existing stick/ folder of motbuchanan/gameshelf (replace index.html and sw.js, add the five wav files):
  stick/index.html      v0.4
  stick/sw.js           cache stick-v0-4 (precaches the wavs)
  stick/count-one.wav, count-two.wav, count-three.wav, count-four.wav, count-and.wav   (~11 KB each)

Root index.html and sw.js are unchanged; nothing else to upload.

What was wrong: the count-in used the browser's speech synthesizer (speechSynthesis), which starts whenever the device feels like it, 100 to 500 ms late and different every time, and on iPad it queues. It could never line up with the click.
Fix: five short recorded words scheduled on the Web Audio clock, the same clock the click and the drums use. Verified headless: 0.0 ms error on all four count-in beats.
New: a "🗣 Count" button next to Click. Off = numbers only on the count-in (default). On = "1 2 3 4" spoken on every bar while a pattern plays, so he can count along.
Fallback: if the wavs fail to load (downloaded file, offline before first visit), the count-in uses rising pitched tones instead of silence.
