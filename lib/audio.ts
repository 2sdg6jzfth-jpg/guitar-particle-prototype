// Web Audio synthesis for chords and metronome.
// AudioContext is lazy-initialized — must be triggered by a user gesture
// (e.g. a button click) before iOS Safari will let it play.

import type { ChordVoicing } from './mock-data';

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const Ctor =
      typeof window !== 'undefined'
        ? (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
        : null;
    if (!Ctor) throw new Error('Web Audio not supported');
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Standard tuning string frequencies (string 1 = high e, string 6 = low E)
const STRING_FREQS = [
  329.63, // 1: E4
  246.94, // 2: B3
  196.00, // 3: G3
  146.83, // 4: D3
  110.00, // 5: A2
  82.41,  // 6: E2
];

/** Play one note with a guitar-ish pluck envelope */
function playNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration = 1.6,
  volume = 0.11
) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = 'triangle';
  osc2.type = 'triangle';
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 1.005; // slight detune for thickness

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(freq * 7, 8000);
  filter.Q.value = 0.7;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
}

/** Strum a chord — calculates per-string frequency from voicing + capo. */
export function playChord(voicing: ChordVoicing, capoFret = 0, isDownStrum = true) {
  const ctx = getAudioContext();
  const startTime = ctx.currentTime;
  const baseFret = voicing.baseFret ?? 1;

  const notes: { freq: number; string: number }[] = [];

  for (let s = 1; s <= 6; s++) {
    if (voicing.mutedStrings.includes(s)) continue;

    const pos = voicing.positions.find(p => p.string === s);
    let absFret: number;

    if (pos) {
      // Fingered note: capo + (baseFret offset) + fret in window
      absFret = capoFret + (baseFret - 1) + pos.fret;
    } else if (voicing.openStrings.includes(s)) {
      // Open (under capo if capo present)
      absFret = capoFret;
    } else {
      // Not played in this voicing
      continue;
    }

    const baseFreq = STRING_FREQS[s - 1];
    const freq = baseFreq * Math.pow(2, absFret / 12);
    notes.push({ freq, string: s });
  }

  // Strum order: low-to-high for downstrum, reverse for upstrum
  notes.sort((a, b) => (isDownStrum ? b.string - a.string : a.string - b.string));

  notes.forEach((n, i) => {
    playNote(ctx, n.freq, startTime + i * 0.012, 1.6);
  });
}

/** Metronome click — higher pitch for downbeat. */
export function playClick(isDownbeat = false) {
  const ctx = getAudioContext();
  const time = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.frequency.value = isDownbeat ? 1100 : 800;
  osc.type = 'square';

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(isDownbeat ? 0.07 : 0.05, time + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.05);
}

/** Stop everything currently playing. */
export function stopAllAudio() {
  if (audioCtx && audioCtx.state === 'running') {
    // We don't track individual nodes, so this is a no-op for in-flight notes.
    // The notes have short envelopes and self-stop. This function exists for future use.
  }
}
