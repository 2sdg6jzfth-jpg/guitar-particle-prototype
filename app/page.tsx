'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { BottomNav } from '@/components/bottom-nav';
import { PlectrumToNoteMorph } from '@/components/plectrum-to-note-morph';
import { PulsingRings } from '@/components/pulsing-rings';

type State = 'idle' | 'listening' | 'result';

const LISTEN_DURATION_MS = 12000;

function formatTimer(secsLeft: number) {
  const m = Math.floor(secsLeft / 60);
  const s = secsLeft % 60;
  return `0:${s.toString().padStart(2, '0')}`;
}

export default function HomePage() {
  const [state, setState] = useState<State>('idle');
  const [secsLeft, setSecsLeft] = useState(12);
  const [songInfo, setSongInfo] = useState<{ id: string; title: string; artist: string } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  useEffect(() => () => cleanup(), []);

  const handleTap = () => {
    if (state === 'idle') {
      setState('listening');
      setSecsLeft(12);
      setSongInfo(null);

      intervalRef.current = setInterval(() => {
        setSecsLeft(prev => Math.max(0, prev - 1));
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        cleanup();
        setSongInfo({ id: 'wonderwall', title: 'Wonderwall', artist: 'Oasis' });
        setState('result');
      }, LISTEN_DURATION_MS);
    } else if (state === 'listening') {
      cleanup();
      setState('idle');
      setSecsLeft(12);
    } else if (state === 'result') {
      // tap again restarts
      setState('idle');
      setSongInfo(null);
    }
  };

  const isResult = state === 'result' && songInfo !== null;

  return (
    <>
      <CrossLitHalos intensity="high" />
      <StatusBar />

      {/* Top corners */}
      <Link
        href="/tuner"
        aria-label="Tuner"
        className="absolute top-12 left-3 w-10 h-10 flex items-center justify-center z-10"
      >
        {/* Tuning fork */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFD89A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 4v9a3 3 0 0 0 6 0V4" />
          <line x1="12" y1="13" x2="12" y2="22" />
          <line x1="9" y1="4" x2="9" y2="2" />
          <line x1="15" y1="4" x2="15" y2="2" />
        </svg>
      </Link>
      <Link
        href="/settings"
        aria-label="Settings"
        className="absolute top-12 right-3 w-10 h-10 flex items-center justify-center z-10"
      >
        <SettingsIcon size={26} strokeWidth={2} className="text-text" />
      </Link>

      {/* Title block */}
      <motion.div
        key={isResult ? 'result-title' : 'idle-title'}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute top-[120px] left-0 right-0 text-center px-6"
      >
        {isResult ? (
          <>
            <div className="text-xl font-medium tracking-tight">{songInfo!.title}</div>
            <div className="text-xs text-text/55 mt-1.5">{songInfo!.artist}</div>
          </>
        ) : (
          <>
            <div className="text-xl font-medium tracking-tight">
              {state === 'listening' ? 'Listening' : 'Tap to identify'}
            </div>
            <div className="text-xs text-text/55 mt-1.5">
              {state === 'listening' ? 'Hold close to the music' : 'Hold close, tap the plectrum'}
            </div>
          </>
        )}
      </motion.div>

      {/* Hero zone */}
      <button
        onClick={handleTap}
        aria-label={state === 'idle' ? 'Identify song' : state === 'listening' ? 'Cancel' : 'Tap again'}
        className="absolute top-[200px] left-0 right-0 h-[280px] flex items-center justify-center"
      >
        {state === 'listening' && <PulsingRings />}

        {/* Central glow halo */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-[200px] h-[210px] pointer-events-none"
          style={{
            x: '-50%',
            y: '-50%',
            background:
              'radial-gradient(ellipse at center, rgba(255,216,154,0.22), rgba(168,233,244,0.12) 45%, transparent 70%)',
          }}
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.06, 1] }}
          transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
        />

        {/* Breathing plectrum / morph */}
        <motion.div
          animate={state === 'idle' ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={
            state === 'idle'
              ? { duration: 5, ease: 'easeInOut', repeat: Infinity }
              : { duration: 0.6, ease: 'easeOut' }
          }
          className="relative z-10"
        >
          <PlectrumToNoteMorph state={isResult ? 'note' : 'plectrum'} />
        </motion.div>
      </button>

      {/* Progress / hint area */}
      {state === 'listening' && (
        <>
          <div className="absolute top-[510px] left-1/2 -translate-x-1/2 w-[200px] h-[3px] bg-text/10 rounded-full overflow-hidden">
            <motion.div
              key="progress"
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(to right, #FFD89A, #A8E9F4)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 12, ease: 'linear' }}
            />
          </div>
          <div className="absolute top-[528px] left-0 right-0 text-center text-[13px] text-text/55 tabular-nums tracking-wider">
            {formatTimer(secsLeft)}
          </div>
          <div className="absolute top-[565px] left-0 right-0 text-center text-[11px] text-text/40">
            Tap anywhere to stop
          </div>
        </>
      )}

      {state === 'result' && songInfo && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute top-[520px] left-0 right-0 flex flex-col items-center gap-3"
        >
          <Link
            href={`/chord/${songInfo.id}`}
            className="px-6 py-3 rounded-3xl bg-amber text-bg-primary text-sm font-medium shadow-cta-amber"
          >
            View chords →
          </Link>
          <button
            onClick={() => {
              setState('idle');
              setSongInfo(null);
            }}
            className="text-[11px] text-text/45"
          >
            Identify another
          </button>
        </motion.div>
      )}

      {state === 'idle' && (
        <div className="absolute top-[510px] left-0 right-0 text-center text-[13px] text-text/40">
          Tap to identify
        </div>
      )}

      <BottomNav />
      <HomeIndicator />
    </>
  );
}
