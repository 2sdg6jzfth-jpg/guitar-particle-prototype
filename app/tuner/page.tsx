'use client';

import { useState } from 'react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { PageTitleBar } from '@/components/page-title-bar';
import { ChevronDown } from 'lucide-react';

const STRINGS = [
  { label: 'E', octave: 2, freq: '82.41' },
  { label: 'A', octave: 2, freq: '110.00' },
  { label: 'D', octave: 3, freq: '146.83' },
  { label: 'G', octave: 3, freq: '196.00' },
  { label: 'B', octave: 3, freq: '246.94' },
  { label: 'E', octave: 4, freq: '329.63' },
];

export default function TunerPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = STRINGS[activeIdx];

  return (
    <>
      <CrossLitHalos intensity="medium" />
      <StatusBar />
      <PageTitleBar title="Tuner" />

      {/* Tuning preset pill */}
      <button className="absolute top-[108px] left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-text/[0.04] border border-text/[0.08] rounded-3xl">
        <span className="text-[13px] font-medium text-text">E Standard</span>
        <ChevronDown size={12} className="text-amber" strokeWidth={2.5} />
      </button>

      {/* Detected note */}
      <div className="absolute top-[170px] left-0 right-0 text-center">
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

      {/* Cents meter */}
      <div className="absolute top-[370px] left-6 right-6">
        <div
          className="relative h-[5px] rounded-sm overflow-hidden"
          style={{
            background:
              'linear-gradient(to right, #5DD3E8 0%, #5DD3E8 28%, rgba(245,235,215,0.18) 44%, rgba(245,235,215,0.18) 56%, #FFD89A 72%, #FFD89A 100%)',
          }}
        >
          {/* Center marker */}
          <div className="absolute -top-2 -bottom-2 left-1/2 w-0.5 -ml-px bg-text/85 rounded-full" />
          {/* Indicator dot — 38% (slightly flat) */}
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

      {/* String buttons */}
      <div className="absolute top-[470px] left-4 right-4 flex justify-between">
        {STRINGS.map((s, i) => (
          <button
            key={i}
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
