// Autocorrelation-based pitch detection. Good enough for guitar tuning;
// not a full YIN implementation, but reliable in the 60–1500 Hz range.

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

export type DetectedNote = {
  freq: number;
  midi: number;
  name: string;
  octave: number;
  cents: number; // ± from nearest semitone
};

/** Returns fundamental frequency in Hz, or -1 if no clear pitch. */
export function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let SIZE = buf.length;

  // RMS — bail if too quiet
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  // Trim leading/trailing silence
  let r1 = 0;
  let r2 = SIZE - 1;
  const threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < threshold) { r1 = i; break; }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < threshold) { r2 = SIZE - i; break; }
  }
  const trimmed = buf.subarray(r1, r2);
  SIZE = trimmed.length;
  if (SIZE < 2) return -1;

  // Autocorrelation
  const c = new Array<number>(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] += trimmed[j] * trimmed[j + i];
    }
  }

  // Skip past initial peak (lag 0) — find first valley
  let d = 0;
  while (d + 1 < SIZE && c[d] > c[d + 1]) d++;

  // Find max after the valley
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;
  if (T0 <= 0) return -1;

  // Parabolic interpolation around the peak for sub-sample accuracy
  if (T0 > 0 && T0 < SIZE - 1) {
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a !== 0) T0 = T0 - b / (2 * a);
  }

  return sampleRate / T0;
}

/** Convert frequency (Hz) to nearest MIDI note + cents offset. */
export function freqToNote(freq: number): DetectedNote {
  const midiFloat = 69 + 12 * Math.log2(freq / 440);
  const midi = Math.round(midiFloat);
  const cents = (midiFloat - midi) * 100;
  const noteIdx = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return {
    freq,
    midi,
    name: NOTE_NAMES[noteIdx],
    octave,
    cents,
  };
}

/** Cents offset between two frequencies. */
export function centsBetween(detectedFreq: number, targetFreq: number): number {
  return 1200 * Math.log2(detectedFreq / targetFreq);
}
