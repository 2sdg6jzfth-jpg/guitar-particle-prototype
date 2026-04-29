'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { BottomNav } from '@/components/bottom-nav';
import { Cover } from '@/components/cover';
import { curatedPlaylists, recommendedForYou } from '@/lib/mock-data';

export default function ForYouPage() {
  return (
    <>
      <CrossLitHalos intensity="low" />
      <StatusBar />

      <h1 className="absolute top-[60px] left-4 text-2xl font-medium tracking-tight text-text">For you</h1>

      <div className="absolute top-[110px] bottom-[90px] left-0 right-0 overflow-y-auto no-scrollbar">
        {/* Streak card */}
        <div className="px-4">
          <div
            className="rounded-2xl p-4 border border-amber/25"
            style={{
              background: 'linear-gradient(135deg, rgba(255,182,97,0.18), rgba(255,216,154,0.06))',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber/20 flex items-center justify-center">
                <Flame size={20} strokeWidth={2} className="text-amber" fill="#FFD89A" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text">3 day streak</div>
                <div className="text-[11px] text-text/55">5 / 15 min today</div>
              </div>
            </div>
            <div className="mt-3 h-1.5 bg-text/[0.08] rounded-full overflow-hidden">
              <div className="h-full bg-amber rounded-full" style={{ width: '33%' }} />
            </div>
          </div>
        </div>

        {/* Curated playlists */}
        <section className="mt-6">
          <h2 className="text-[11px] uppercase tracking-wider text-text/50 font-medium px-4 mb-3">
            Curated for you
          </h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
            {curatedPlaylists.map(p => (
              <button
                key={p.id}
                className="flex-shrink-0 w-[130px] h-[130px] rounded-2xl p-3 flex flex-col justify-between border border-text/[0.08] relative overflow-hidden"
                style={{
                  background:
                    p.id === 'beginner'
                      ? 'linear-gradient(135deg, #FFD89A, rgba(255,216,154,0.15))'
                      : p.id === 'c-major'
                      ? 'linear-gradient(135deg, #A8E9F4, rgba(168,233,244,0.15))'
                      : p.id === '90s-rock'
                      ? 'linear-gradient(135deg, #FFB661, rgba(255,182,97,0.15))'
                      : 'linear-gradient(135deg, #5DD3E8, rgba(93,211,232,0.15))',
                }}
              >
                <div className="text-[13px] font-semibold text-bg-primary leading-tight">
                  {p.title}
                </div>
                <div className="text-[10px] text-bg-primary/70 font-medium">{p.count} songs</div>
              </button>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section className="mt-6 pb-6">
          <h2 className="text-[11px] uppercase tracking-wider text-text/50 font-medium px-4 mb-2">
            Because you like Oasis
          </h2>
          <div className="flex flex-col px-4">
            {recommendedForYou.map(s => (
              <Link
                key={s.id}
                href={`/chord/${s.id}`}
                className="flex items-center gap-3 py-2.5 border-b border-text/[0.06] active:bg-text/[0.03]"
              >
                <Cover variant={s.cover} size={44} rounded="rounded-lg" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text truncate">{s.title}</div>
                  <div className="text-[11px] text-text/55 truncate">{s.artist}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
      <HomeIndicator />
    </>
  );
}
