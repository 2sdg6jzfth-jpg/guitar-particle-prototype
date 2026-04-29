'use client';

import { useEffect, useRef, useState } from 'react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { PageTitleBar } from '@/components/page-title-bar';
import { ChevronDown, Check } from 'lucide-react';

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

export default function TunerPage() {
  const [tuningIdx, setTuningIdx] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const tuning = TUNINGS[tuningIdx];
  const active = tuning.strings[activeIdx];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  const selectTuning = (idx: number) => {
    setTuningIdx(idx);
    setActiveIdx(0);
    setPickerOpen(false);
  };

  return (
    <>
      <CrossLitHalos intensity="medium" />
      <StatusBar />
      <PageTitleBar title="Tuner" />

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

      <div className="absolute top-[180px] left-0 right-0 text-center pointer-events-none">
        <div
          className="text-[112px] font-light text-text leading-none tabular-nums"
          style={{ letterSpacing: '-3px' }}
        >
          {active.label}
        </div>
        <div className="mt-2 text-[13px] text-text/55 tabular-nums tracking-wider">
          {active.label}
          {active.octave} · {active.freq} Hz
        </div>
      </div>

      <div className="absolute top-[380px] left-6 right-6">
        <div
          className="relative h-[5px] rounded-sm overflow-hidden"
          style={{
            background:
              'linear-gradient(to right, #5DD3E8 0%, #5DD3E8 28%, rgba(245,235,215,0.18) 44%, rgba(245,235,215,0.18) 56%, #FFD89A 72%, #FFD89A 100%)',
          }}
        >
          <div className="absolute -top-2 -bottom-2 left-1/2 w-0.5 -ml-px bg-text/85 rounded-full" />
          <div
            className="absolute -top-2.5 w-5 h-5 rounded-full bg-text border-[1.5px] border-cyan-deep -ml-2.5"
            style={{ left: '38%', boxShadow: '0 0 18px rgba(93,211,232,0.55)' }}
          />
        </div>
        <div className="flex justify-between mt-3.5 text-[9px] text-text/50 tracking-wider uppercase tabular-nums">
          <span>−50</span>
          <span>−10</span>
          <span>0</span>
          <span>+10</span>
          <span>+50</span>
        </div>
      </div>

      <div className="absolute top-[470px] left-4 right-4 flex justify-between">
        {tuning.strings.map((s, i) => (
          <button
            key={`${tuning.id}-${i}`}
            onClick={() => setActiveIdx(i)}
            className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
              i === activeIdx
                ? 'bg-amber/15 border border-amber/50 text-amber'
                : 'bg-text/[0.04] border border-text/10 text-text'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="absolute top-[535px] left-0 right-0 text-center text-[11px] text-text/40">
        Auto-detecting · or tap a string
      </div>

      <p className="absolute bottom-12 left-0 right-0 text-center text-[10px] text-text/30 px-8">
        Prototype tuner — pitch detection comes in the production app.
      </p>

      <HomeIndicator />
    </>
  );
}
