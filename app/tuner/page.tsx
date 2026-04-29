'use client';

import { useEffect, useRef, useState } from 'react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { PageTitleBar } from '@/components/page-title-bar';
import { ChevronDown, Check, Mic, MicOff } from 'lucide-react';
import { autoCorrelate, centsBetween, freqToNote } from '@/lib/pitch';

type StringNote = { label: string; octave: number; freq: string };
type Tuning = { id: string; name: string; strings: StringNote[] };

const TUNINGS: Tuning[] = [
  {
    id: 'e-standard',
    name: 'E Standard',
    strings: [
      { label: 'E', octave: 2, freq: '82.41' },
      { label: 'A', octave: 2, freq: '110.00' },
      { label: 'D', octave: 3, freq: '146.83' },
      { label: 'G', octave: 3, freq: '196.00' },
      { label: 'B', octave: 3, freq: '246.94' },
      { label: 'E', octave: 4, freq: '329.63' },
    ],
  },
  {
    id: 'drop-d',
    name: 'Drop D',
    strings: [
      { label: 'D', octave: 2, freq: '73.42' },
      { label: 'A', octave: 2, freq: '110.00' },
      { label: 'D', octave: 3, freq: '146.83' },
      { label: 'G', octave: 3, freq: '196.00' },
      { label: 'B', octave: 3, freq: '246.94' },
      { label: 'E', octave: 4, freq: '329.63' },
    ],
  },
  {
    id: 'half-step-down',
    name: 'Half-step down',
    strings: [
      { label: 'E♭', octave: 2, freq: '77.78' },
      { label: 'A♭', octave: 2, freq: '103.83' },
      { label: 'D♭', octave: 3, freq: '138.59' },
      { label: 'G♭', octave: 3, freq: '185.00' },
      { label: 'B♭', octave: 3, freq: '233.08' },
      { label: 'E♭', octave: 4, freq: '311.13' },
    ],
  },
  {
    id: 'open-g',
    name: 'Open G',
    strings: [
      { label: 'D', octave: 2, freq: '73.42' },
      { label: 'G', octave: 2, freq: '98.00' },
      { label: 'D', octave: 3, freq: '146.83' },
      { label: 'G', octave: 3, freq: '196.00' },
      { label: 'B', octave: 3, freq: '246.94' },
      { label: 'D', octave: 4, freq: '293.66' },
    ],
  },
  {
    id: 'dadgad',
    name: 'DADGAD',
    strings: [
      { label: 'D', octave: 2, freq: '73.42' },
      { label: 'A', octave: 2, freq: '110.00' },
      { label: 'D', octave: 3, freq: '146.83' },
      { label: 'G', octave: 3, freq: '196.00' },
      { label: 'A', octave: 3, freq: '220.00' },
      { label: 'D', octave: 4, freq: '293.66' },
    ],
  },
];

type MicState = 'idle' | 'requesting' | 'listening' | 'denied' | 'error';

export default function TunerPage() {
  const [tuningIdx, setTuningIdx] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manualStringIdx, setManualStringIdx] = useState<number | null>(null);
  const [detected, setDetected] = useState<{
    freq: number;
    nearestStringIdx: number;
    cents: number;
  } | null>(null);
  const [micState, setMicState] = useState<MicState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const tuningIdxRef = useRef(tuningIdx);

  // Keep ref in sync so the audio loop sees the latest tuning
  useEffect(() => {
    tuningIdxRef.current = tuningIdx;
  }, [tuningIdx]);

  const tuning = TUNINGS[tuningIdx];

  // Outside-click handler for picker
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const startMic = async () => {
    setMicState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;

      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      src.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      setMicState('listening');

      const loop = () => {
        analyser.getFloatTimeDomainData(buffer);
        const freq = autoCorrelate(buffer, ctx.sampleRate);

        if (freq > 60 && freq < 1500) {
          // Find nearest string in current tuning
          const currentTuning = TUNINGS[tuningIdxRef.current];
          let bestIdx = 0;
          let bestAbsCents = Infinity;
          let bestSignedCents = 0;
          currentTuning.strings.forEach((s, i) => {
            const c = centsBetween(freq, parseFloat(s.freq));
            if (Math.abs(c) < bestAbsCents) {
              bestAbsCents = Math.abs(c);
              bestSignedCents = c;
              bestIdx = i;
            }
          });
          setDetected({ freq, nearestStringIdx: bestIdx, cents: bestSignedCents });
        }
        // Else: keep last detection visible (don't reset to null on silence)

        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) {
      const err = e as Error;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicState('denied');
      } else {
        setMicState('error');
        setErrorMsg(err.message || 'Could not access microphone');
      }
    }
  };

  // Auto-start mic on mount
  useEffect(() => {
    startMic();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effective target string: manual selection beats auto-detect
  const targetStringIdx =
    manualStringIdx !== null ? manualStringIdx : detected?.nearestStringIdx ?? 0;
  const targetString = tuning.strings[targetStringIdx];

  // If manual mode AND we have a detected freq, recalc cents vs the manually-picked string
  const displayCents =
    detected != null
      ? manualStringIdx !== null
        ? centsBetween(detected.freq, parseFloat(targetString.freq))
        : detected.cents
      : 0;

  // Indicator position: -50¢ → 0%, 0¢ → 50%, +50¢ → 100%
  const indicatorPos = Math.max(0, Math.min(100, ((displayCents + 50) / 100) * 100));
  const inTune = detected != null && Math.abs(displayCents) < 5;

  // Side-glow intensity: ramps from 0 at ±5¢ up to 1 at ±35¢ (caps there)
  const glowIntensity = (() => {
    if (!detected) return 0;
    const abs = Math.abs(displayCents);
    if (abs < 5) return 0;
    return Math.min(1, (abs - 5) / 30);
  })();
  const flatness = displayCents < 0 ? glowIntensity : 0;
  const sharpness = displayCents > 0 ? glowIntensity : 0;

  // What note the mic is actually hearing (independent of nearest string)
  const heardNote = detected ? freqToNote(detected.freq) : null;

  const selectTuning = (idx: number) => {
    setTuningIdx(idx);
    setManualStringIdx(null);
    setPickerOpen(false);
  };

  return (
    <>
      <CrossLitHalos intensity="medium" />
      <StatusBar />
      <PageTitleBar title="Tuner" />

      {/* === Sharp/Flat side glows === */}
      <div
        className="absolute top-[140px] bottom-[140px] left-0 w-[180px] pointer-events-none transition-opacity duration-200"
        style={{
          background:
            'radial-gradient(ellipse at left center, rgba(93,211,232,0.55), rgba(93,211,232,0.18) 40%, transparent 75%)',
          opacity: flatness,
        }}
      />
      <div
        className="absolute top-[140px] bottom-[140px] right-0 w-[180px] pointer-events-none transition-opacity duration-200"
        style={{
          background:
            'radial-gradient(ellipse at right center, rgba(255,182,97,0.55), rgba(255,182,97,0.18) 40%, transparent 75%)',
          opacity: sharpness,
        }}
      />
      {/* In-tune halo behind the big note */}
      <div
        className="absolute top-[170px] left-1/2 -translate-x-1/2 w-[260px] h-[200px] rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(circle, rgba(255,216,154,0.32), rgba(255,216,154,0.08) 50%, transparent 75%)',
          opacity: inTune ? 1 : 0,
        }}
      />

      {/* Tuning preset picker */}
      <div ref={pickerRef} className="absolute top-[108px] left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={() => setPickerOpen(o => !o)}
          className="flex items-center gap-2 px-4 py-2 bg-text/[0.04] border border-text/[0.08] rounded-3xl"
        >
          <span className="text-[13px] font-medium text-text">{tuning.name}</span>
          <ChevronDown
            size={12}
            className={`text-amber transition-transform ${pickerOpen ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </button>
        {pickerOpen && (
          <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-[210px] bg-bg-surface border border-text/10 rounded-xl shadow-sheet overflow-hidden z-30">
            {TUNINGS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => selectTuning(i)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs ${
                  i === tuningIdx ? 'bg-amber/[0.08] text-amber' : 'text-text hover:bg-text/[0.04]'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-[10px] text-text/45 tabular-nums mt-0.5">
                    {t.strings.map(s => s.label).join(' · ')}
                  </span>
                </div>
                {i === tuningIdx && <Check size={12} strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Big note display: target prominent, heard underneath */}
      <div className="absolute top-[180px] left-0 right-0 text-center pointer-events-none">
        <div
          className={`text-[112px] font-light leading-none tabular-nums transition-colors ${
            inTune ? 'text-amber' : 'text-text'
          }`}
          style={{ letterSpacing: '-3px' }}
        >
          {targetString.label}
        </div>

        {/* Target line */}
        <div className="mt-2 text-[11px] tracking-wider uppercase text-text/45 font-medium">
          Target
        </div>
        <div className="text-[13px] text-text/75 tabular-nums tracking-wider mt-0.5">
          {targetString.label}
          {targetString.octave} · {targetString.freq} Hz
        </div>

        {/* Hearing line */}
        <div className="mt-3 text-[11px] tracking-wider uppercase text-text/45 font-medium">
          Hearing
        </div>
        <div className="text-[13px] tabular-nums tracking-wider mt-0.5 min-h-[18px]">
          {heardNote ? (
            <>
              <span
                className={`font-medium ${
                  inTune
                    ? 'text-amber'
                    : displayCents < 0
                    ? 'text-cyan-deep'
                    : 'text-amber-deep'
                }`}
              >
                {heardNote.name}
                {heardNote.octave}
              </span>
              <span className="text-text/55"> · {detected!.freq.toFixed(1)} Hz</span>
            </>
          ) : (
            <span className="text-text/35">—</span>
          )}
        </div>
      </div>

      {/* Cents meter */}
      <div className="absolute top-[420px] left-6 right-6">
        <div
          className="relative h-[5px] rounded-sm overflow-hidden"
          style={{
            background:
              'linear-gradient(to right, #5DD3E8 0%, #5DD3E8 28%, rgba(245,235,215,0.18) 44%, rgba(245,235,215,0.18) 56%, #FFD89A 72%, #FFD89A 100%)',
          }}
        >
          <div className="absolute -top-2 -bottom-2 left-1/2 w-0.5 -ml-px bg-text/85 rounded-full" />
          <div
            className={`absolute -top-2.5 w-5 h-5 rounded-full border-[1.5px] -ml-2.5 transition-all duration-150 ${
              inTune
                ? 'bg-amber border-amber'
                : displayCents < 0
                ? 'bg-text border-cyan-deep'
                : 'bg-text border-amber'
            }`}
            style={{
              left: `${indicatorPos}%`,
              boxShadow: inTune
                ? '0 0 18px rgba(255,216,154,0.65)'
                : displayCents < 0
                ? '0 0 18px rgba(93,211,232,0.55)'
                : '0 0 18px rgba(255,216,154,0.35)',
            }}
          />
        </div>
        <div className="flex justify-between mt-3.5 text-[9px] text-text/50 tracking-wider uppercase tabular-nums">
          <span>−50</span>
          <span>−10</span>
          <span>0</span>
          <span>+10</span>
          <span>+50</span>
        </div>
        {detected != null && (
          <div className="mt-2 text-center text-[11px] text-text/55 tabular-nums">
            {Math.abs(displayCents) < 1 ? '0' : (displayCents > 0 ? '+' : '') + displayCents.toFixed(1)}
            ¢{' '}
            {inTune ? (
              <span className="text-amber font-medium">In tune</span>
            ) : displayCents < 0 ? (
              <span className="text-cyan-deep">Flat</span>
            ) : (
              <span className="text-amber/80">Sharp</span>
            )}
          </div>
        )}
      </div>

      {/* String buttons */}
      <div className="absolute top-[510px] left-4 right-4 flex justify-between">
        {tuning.strings.map((s, i) => {
          const active = i === targetStringIdx;
          return (
            <button
              key={`${tuning.id}-${i}`}
              onClick={() => setManualStringIdx(i === manualStringIdx ? null : i)}
              className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                active
                  ? 'bg-amber/15 border border-amber/50 text-amber'
                  : 'bg-text/[0.04] border border-text/10 text-text'
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Mic status / instructions */}
      <div className="absolute top-[570px] left-0 right-0 text-center px-6">
        {micState === 'listening' && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-text/50">
            <Mic size={11} className="text-amber" />
            <span>
              {manualStringIdx !== null
                ? `Tuning ${tuning.strings[manualStringIdx].label}${tuning.strings[manualStringIdx].octave} — tap again for auto`
                : 'Listening · play any string'}
            </span>
          </div>
        )}
        {(micState === 'requesting' || micState === 'idle') && (
          <div className="text-[11px] text-text/45">Asking for microphone…</div>
        )}
        {micState === 'denied' && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-destructive">
              <MicOff size={11} />
              <span>Microphone access denied</span>
            </div>
            <button
              onClick={startMic}
              className="px-3 py-1.5 rounded-2xl bg-amber/15 border border-amber/40 text-amber text-[11px] font-medium"
            >
              Try again
            </button>
          </div>
        )}
        {micState === 'error' && (
          <div className="text-[11px] text-destructive">Mic error: {errorMsg}</div>
        )}
      </div>

      <HomeIndicator />
    </>
  );
}
