'use client';

import { useEffect, useRef, useState } from 'react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { PageTitleBar } from '@/components/page-title-bar';
import { SegmentedControl } from '@/components/segmented-control';
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
type Mode = 'Tuning' | 'Chromatic';
const MODE_OPTIONS = ['Tuning', 'Chromatic'] as const;

const TUNE_BLUE = '#5DD3E8'; // cyan-deep, used as "in tune" blue

export default function TunerPage() {
  const [mode, setMode] = useState<Mode>('Tuning');
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

  useEffect(() => {
    tuningIdxRef.current = tuningIdx;
  }, [tuningIdx]);

  const tuning = TUNINGS[tuningIdx];

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

  const isChromatic = mode === 'Chromatic';
  const heardNote = detected ? freqToNote(detected.freq) : null;

  // Compute target + cents based on mode
  const targetStringIdx =
    manualStringIdx !== null ? manualStringIdx : detected?.nearestStringIdx ?? 0;
  const targetString = tuning.strings[targetStringIdx];

  const tuningCents =
    detected != null
      ? manualStringIdx !== null
        ? centsBetween(detected.freq, parseFloat(targetString.freq))
        : detected.cents
      : 0;

  const chromaticCents = heardNote ? heardNote.cents : 0;

  const displayCents = isChromatic ? chromaticCents : tuningCents;

  // Big display content
  const bigLetter = isChromatic
    ? heardNote?.name ?? '—'
    : targetString.label;
  const bigSubtitleTop = isChromatic ? 'HEARING' : 'TARGET';
  const bigSubtitleValue = isChromatic
    ? heardNote
      ? `${heardNote.name}${heardNote.octave} · ${detected!.freq.toFixed(1)} Hz`
      : 'Listening…'
    : `${targetString.label}${targetString.octave} · ${targetString.freq} Hz`;

  // Indicator + glows
  const indicatorPos = Math.max(0, Math.min(100, ((displayCents + 50) / 100) * 100));
  const inTune = detected != null && Math.abs(displayCents) < 5;

  const glowIntensity = (() => {
    if (!detected || inTune) return 0;
    const abs = Math.abs(displayCents);
    if (abs < 5) return 0;
    return Math.min(1, (abs - 5) / 30);
  })();
  const flatness = displayCents < 0 ? glowIntensity : 0;
  const sharpness = displayCents > 0 ? glowIntensity : 0;

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

      {/* Side glows */}
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
      {/* In-tune blue halo */}
      <div
        className="absolute top-[170px] left-1/2 -translate-x-1/2 w-[260px] h-[200px] rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(circle, rgba(93,211,232,0.42), rgba(168,233,244,0.12) 50%, transparent 75%)',
          opacity: inTune ? 1 : 0,
        }}
      />

      {/* Mode toggle + tuning preset (preset hidden in chromatic) */}
      <div
        className={`absolute top-[100px] left-4 right-4 flex items-center gap-2 z-20 ${
          isChromatic ? 'justify-center' : ''
        }`}
      >
        <SegmentedControl
          options={MODE_OPTIONS}
          value={mode}
          onChange={setMode}
          size="sm"
          className="h-8 w-[136px]"
        />
        {!isChromatic && (
          <div ref={pickerRef} className="relative flex-1">
            <button
              onClick={() => setPickerOpen(o => !o)}
              className="w-full flex items-center justify-center gap-1.5 h-8 bg-text/[0.04] border border-text/[0.08] rounded-3xl"
            >
              <span className="text-[12px] font-medium text-text">{tuning.name}</span>
              <ChevronDown
                size={11}
                strokeWidth={2.5}
                className={`text-amber transition-transform ${pickerOpen ? 'rotate-180' : ''}`}
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
        )}
      </div>

      {/* Big note */}
      <div className="absolute top-[178px] left-0 right-0 text-center pointer-events-none">
        <div
          className="text-[112px] font-light leading-none tabular-nums transition-colors duration-200"
          style={{
            letterSpacing: '-3px',
            color: inTune ? TUNE_BLUE : '#F5EBD7',
          }}
        >
          {bigLetter}
        </div>

        <div className="mt-2 text-[11px] tracking-wider uppercase text-text/45 font-medium">
          {bigSubtitleTop}
        </div>
        <div className="text-[13px] text-text/75 tabular-nums tracking-wider mt-0.5">
          {bigSubtitleValue}
        </div>

        {/* In tuning mode, also show what we're actually hearing */}
        {!isChromatic && (
          <>
            <div className="mt-3 text-[11px] tracking-wider uppercase text-text/45 font-medium">
              Hearing
            </div>
            <div className="text-[13px] tabular-nums tracking-wider mt-0.5 min-h-[18px]">
              {heardNote && detected ? (
                <>
                  <span
                    className="font-medium transition-colors"
                    style={{
                      color: inTune
                        ? TUNE_BLUE
                        : tuningCents < 0
                        ? '#5DD3E8'
                        : '#FFB661',
                    }}
                  >
                    {heardNote.name}
                    {heardNote.octave}
                  </span>
                  <span className="text-text/55"> · {detected.freq.toFixed(1)} Hz</span>
                </>
              ) : (
                <span className="text-text/35">—</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Cents meter — bigger dot, fill bar from center to dot */}
      <div className="absolute top-[420px] left-6 right-6">
        <div
          className="relative h-[8px] rounded-full overflow-visible"
          style={{
            background:
              'linear-gradient(to right, rgba(93,211,232,0.18) 0%, rgba(245,235,215,0.06) 35%, rgba(245,235,215,0.06) 65%, rgba(255,216,154,0.18) 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(245,235,215,0.06)',
          }}
        >
          {/* Fill bar from center toward dot — shrinks as you tune in */}
          {detected && !inTune && (
            <div
              className="absolute top-0 bottom-0 transition-all duration-200 rounded-full"
              style={{
                left: displayCents < 0 ? `${indicatorPos}%` : '50%',
                width: `${Math.abs(50 - indicatorPos)}%`,
                background: displayCents < 0 ? '#5DD3E8' : '#FFD89A',
                opacity: 0.7,
              }}
            />
          )}

          {/* Center marker */}
          <div className="absolute -top-2.5 -bottom-2.5 left-1/2 w-[2px] -ml-px bg-text/85 rounded-full" />

          {/* Indicator dot — bigger, blue when in tune */}
          <div
            className="absolute w-7 h-7 rounded-full border-[2.5px] -ml-[14px] -top-[10px] transition-all duration-200"
            style={{
              left: `${indicatorPos}%`,
              background: inTune ? TUNE_BLUE : '#F5EBD7',
              borderColor: inTune
                ? '#A8E9F4'
                : displayCents < 0
                ? '#5DD3E8'
                : '#FFD89A',
              boxShadow: inTune
                ? '0 0 24px rgba(93,211,232,0.95), 0 0 48px rgba(168,233,244,0.4)'
                : `0 0 12px ${
                    displayCents < 0 ? 'rgba(93,211,232,0.45)' : 'rgba(255,216,154,0.4)'
                  }`,
            }}
          />
        </div>

        <div className="flex justify-between mt-4 text-[9px] text-text/50 tracking-wider uppercase tabular-nums">
          <span>−50</span>
          <span>−10</span>
          <span>0</span>
          <span>+10</span>
          <span>+50</span>
        </div>

        {detected && (
          <div className="mt-2 text-center text-[11px] tabular-nums">
            {inTune ? (
              <span className="font-medium" style={{ color: TUNE_BLUE }}>
                ✓ In tune
              </span>
            ) : (
              <>
                <span className="text-text/55">
                  {Math.abs(displayCents) < 1
                    ? '0'
                    : (displayCents > 0 ? '+' : '') + displayCents.toFixed(1)}
                  ¢{' '}
                </span>
                <span className={displayCents < 0 ? 'text-cyan-deep' : 'text-amber-deep'}>
                  {displayCents < 0 ? 'Flat' : 'Sharp'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* String buttons — only in tuning mode */}
      {!isChromatic && (
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
      )}

      {/* Mic status */}
      <div className="absolute top-[570px] left-0 right-0 text-center px-6">
        {micState === 'listening' && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-text/50">
            <Mic size={11} className="text-amber" />
            <span>
              {isChromatic
                ? 'Listening · play any note'
                : manualStringIdx !== null
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
