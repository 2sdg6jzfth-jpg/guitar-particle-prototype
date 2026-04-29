'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { BottomNav } from '@/components/bottom-nav';
import { Cover } from '@/components/cover';
import { storage, type SavedSong } from '@/lib/storage';
import { Music } from 'lucide-react';

export default function ChordsPage() {
  const [recent, setRecent] = useState<SavedSong | null>(null);

  useEffect(() => {
    const saved = storage.getSavedSongs();
    if (saved.length > 0) {
      const sorted = [...saved].sort((a, b) => b.savedAt - a.savedAt);
      setRecent(sorted[0]);
    }
  }, []);

  return (
    <>
      <CrossLitHalos intensity="low" />
      <StatusBar />

      <h1 className="absolute top-[60px] left-4 text-2xl font-medium tracking-tight text-text">Chords</h1>

      {recent ? (
        <div className="absolute top-[110px] left-0 right-0 px-4">
          <div className="text-[11px] uppercase tracking-wider text-text/50 mb-3">Recently opened</div>
          <Link
            href={`/chord/${recent.songId}`}
            className="flex items-center gap-3 p-3 rounded-2xl bg-text/[0.04] border border-text/[0.08]"
          >
            <Cover variant="gradient-wonderwall" size={56} />
            <div className="flex-1">
              <div className="text-base font-medium text-text">{recent.title}</div>
              <div className="text-xs text-text/55">{recent.artist}</div>
              <div className="text-[10px] text-amber mt-1 uppercase tracking-wider">Key {recent.key} · Resume</div>
            </div>
          </Link>

          <div className="mt-6 text-[11px] uppercase tracking-wider text-text/50 mb-3">Jump to</div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/library"
              className="rounded-2xl p-4 bg-text/[0.03] border border-text/[0.08] flex flex-col gap-1"
            >
              <span className="text-sm font-medium text-text">Your library</span>
              <span className="text-[11px] text-text/55">All saved songs</span>
            </Link>
            <Link
              href="/strum-builder"
              className="rounded-2xl p-4 bg-text/[0.03] border border-text/[0.08] flex flex-col gap-1"
            >
              <span className="text-sm font-medium text-text">Custom strum</span>
              <span className="text-[11px] text-amber/80">Pro</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="absolute top-[200px] bottom-[110px] left-0 right-0 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-text/[0.04] border border-text/[0.08] flex items-center justify-center mb-5">
            <Music size={26} strokeWidth={2} className="text-text/55" />
          </div>
          <h3 className="text-base font-medium text-text mb-1.5">Identify a song first</h3>
          <p className="text-xs text-text/55 mb-6 leading-relaxed">
            Once you&apos;ve identified or saved a song, you can pick up here.
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl bg-amber text-bg-primary text-sm font-medium shadow-cta-amber"
          >
            Go to home
          </Link>
        </div>
      )}

      <BottomNav />
      <HomeIndicator />
    </>
  );
}
