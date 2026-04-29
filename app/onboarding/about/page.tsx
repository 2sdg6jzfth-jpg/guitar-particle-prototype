'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { Indicator } from '../welcome/page';
import { ChevronLeft } from 'lucide-react';

const ACCOUNT_KEY = 'guitar_particle_onboarding_partial';

const HAND = ['Right', 'Left'] as const;
const YEARS = ['< 1 year', '1–3 years', '3–10 years', '10+ years'] as const;
const GUITAR = ['Acoustic', 'Electric', 'Classical'] as const;
const STRUM = ['Simple', 'Real'] as const;

export default function AboutPage() {
  const router = useRouter();
  const [hand, setHand] = useState<(typeof HAND)[number]>('Right');
  const [years, setYears] = useState<(typeof YEARS)[number]>('< 1 year');
  const [guitar, setGuitar] = useState<(typeof GUITAR)[number]>('Acoustic');
  const [strum, setStrum] = useState<(typeof STRUM)[number]>('Simple');

  const handleContinue = () => {
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || '{}');
      localStorage.setItem(
        ACCOUNT_KEY,
        JSON.stringify({
          ...existing,
          hand,
          yearsPlaying: years,
          guitarType: guitar,
          defaultStrum: strum,
        })
      );
    }
    router.push('/onboarding/permission');
  };

  return (
    <>
      <CrossLitHalos intensity="high" />
      <StatusBar />

      <button
        onClick={() => router.back()}
        aria-label="Back"
        className="absolute top-12 left-1.5 w-10 h-10 flex items-center justify-center z-10"
      >
        <ChevronLeft size={28} strokeWidth={2.5} className="text-text" />
      </button>

      <div className="absolute top-[100px] left-0 right-0 px-6">
        <h1 className="text-2xl font-medium tracking-tight text-text leading-tight mb-2">
          Tell us about your playing
        </h1>
        <p className="text-sm text-text/55 leading-relaxed">
          We&apos;ll tailor chord voicings and strum patterns to fit.
        </p>
      </div>

      <div className="absolute top-[200px] bottom-[140px] left-0 right-0 px-4 overflow-y-auto no-scrollbar">
        <Group label="Hand">
          <PillRow options={HAND} value={hand} onChange={setHand} />
        </Group>
        <Group label="Years playing">
          <PillRow options={YEARS} value={years} onChange={setYears} small />
        </Group>
        <Group label="Guitar type">
          <PillRow options={GUITAR} value={guitar} onChange={setGuitar} />
        </Group>
        <Group label="Default strum">
          <PillRow options={STRUM} value={strum} onChange={setStrum} />
        </Group>
      </div>

      <button
        onClick={handleContinue}
        className="absolute bottom-[60px] left-4 right-4 h-12 rounded-2xl bg-amber text-bg-primary text-sm font-semibold shadow-cta-amber"
      >
        Continue
      </button>

      <Indicator step={3} />
      <HomeIndicator />
    </>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-wider text-text/45 font-medium px-1 mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}

function PillRow<T extends string>({
  options,
  value,
  onChange,
  small,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  small?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`${small ? 'px-3 h-8 text-[11px]' : 'px-3.5 h-9 text-xs'} rounded-2xl font-medium ${
            value === o
              ? 'bg-amber text-bg-primary'
              : 'bg-text/[0.04] border border-text/[0.1] text-text'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
