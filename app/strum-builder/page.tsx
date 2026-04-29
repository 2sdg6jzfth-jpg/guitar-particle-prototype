'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { ProPaywall } from '@/components/pro-paywall';
import { Toast } from '@/components/toast';
import { ChevronLeft, Play } from 'lucide-react';
import { storage } from '@/lib/storage';

type Cell = 'empty' | 'down' | 'up';
const CYCLE: Record<Cell, Cell> = { empty: 'down', down: 'up', up: 'empty' };
const BEAT_LABELS = ['1', '&', '2', '&', '3', '&', '4', '&'];

export default function StrumBuilderPage() {
  const router = useRouter();
  const [isPro, setIsPro] = useState<boolean | null>(null); // null = not yet checked
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pattern, setPattern] = useState<Cell[]>(Array(8).fill('empty'));
  const [name, setName] = useState('My pattern');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const pro = storage.isPro();
    setIsPro(pro);
    if (!pro) setPaywallOpen(true);
  }, []);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  };

  const cycleCell = (i: number) => {
    if (!isPro) {
      setPaywallOpen(true);
      return;
    }
    setPattern(p => p.map((v, idx) => (idx === i ? CYCLE[v] : v)));
  };

  return (
    <>
      <CrossLitHalos intensity="low" />
      <StatusBar />

      {/* Top bar with Save button */}
      <div className="absolute top-12 left-0 right-0 flex items-center justify-between px-3.5 h-10 z-10">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ChevronLeft size={28} strokeWidth={2.5} className="text-text" />
        </button>
        <h1 className="text-base font-medium text-text">Custom strum</h1>
        <button
          onClick={() => showToast('Pattern saved')}
          className="text-amber text-sm font-medium px-2"
          disabled={!isPro}
        >
          Save
        </button>
      </div>

      {/* Body */}
      <div className="absolute top-[100px] bottom-[80px] left-0 right-0 overflow-y-auto px-4 no-scrollbar">
        {/* Name */}
        <div className="mb-4">
          <label className="text-[10px] uppercase tracking-wider text-text/45 font-medium block mb-1.5">
            Pattern name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={!isPro}
            className="w-full bg-text/[0.04] border border-text/[0.08] rounded-xl px-3.5 h-11 text-sm text-text placeholder:text-text/40 outline-none disabled:opacity-50"
          />
        </div>

        {/* Time signature + beats */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 bg-text/[0.04] border border-text/[0.08] rounded-xl px-3 py-2">
            <div className="text-[9px] uppercase tracking-wider text-text/55">Time</div>
            <div className="text-sm font-medium text-text tabular-nums">4/4</div>
          </div>
          <div className="flex-1 bg-text/[0.04] border border-text/[0.08] rounded-xl px-3 py-2">
            <div className="text-[9px] uppercase tracking-wider text-text/55">Beats</div>
            <div className="text-sm font-medium text-text tabular-nums">8</div>
          </div>
        </div>

        {/* Beat labels */}
        <div className="grid grid-cols-8 gap-1.5 mb-1.5">
          {BEAT_LABELS.map((b, i) => (
            <div
              key={i}
              className={`text-center text-[10px] font-medium tabular-nums ${
                /\d/.test(b) ? 'text-text' : 'text-text/45'
              }`}
            >
              {b}
            </div>
          ))}
        </div>

        {/* Beat grid */}
        <div className="grid grid-cols-8 gap-1.5 mb-4">
          {pattern.map((cell, i) => (
            <button
              key={i}
              onClick={() => cycleCell(i)}
              className={`aspect-square rounded-lg border flex items-center justify-center transition-colors ${
                cell === 'empty'
                  ? 'bg-text/[0.04] border-text/[0.1]'
                  : cell === 'down'
                  ? 'bg-amber/15 border-amber/45'
                  : 'bg-cyan/15 border-cyan-deep/45'
              }`}
            >
              {cell === 'down' && (
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="#FFD89A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="2" x2="7" y2="13" />
                  <polyline points="2 9 7 13 12 9" />
                </svg>
              )}
              {cell === 'up' && (
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none" stroke="#A8E9F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="11" x2="6" y2="2" />
                  <polyline points="2 5 6 2 10 5" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-text/50 leading-relaxed mb-4">
          Tap a cell to cycle: empty → down → up. Use the test play to hear it.
        </p>

        {/* Test play button */}
        <button
          onClick={() => showToast('Playing pattern…')}
          disabled={!isPro}
          className="w-full h-11 rounded-2xl bg-text/[0.04] border border-text/[0.1] text-text text-sm font-medium flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
        >
          <Play size={16} strokeWidth={2} fill="currentColor" />
          Test play
        </button>

        {/* Save CTA */}
        <button
          onClick={() => showToast('Pattern saved')}
          disabled={!isPro}
          className="w-full h-12 rounded-2xl bg-amber text-bg-primary text-sm font-semibold shadow-cta-amber disabled:opacity-50"
        >
          Save pattern
        </button>
      </div>

      <HomeIndicator />

      <ProPaywall
        isOpen={paywallOpen}
        onClose={() => {
          setPaywallOpen(false);
          if (!storage.isPro()) router.back();
        }}
        onUnlock={() => {
          setIsPro(true);
          showToast('Welcome to Pro!');
        }}
      />
      <Toast message={toast} />
    </>
  );
}
