'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, X, Heart, TrendingUp, Clock } from 'lucide-react';
import { CrossLitHalos } from '@/components/cross-lit-halos';
import { StatusBar } from '@/components/status-bar';
import { HomeIndicator } from '@/components/home-indicator';
import { BottomNav } from '@/components/bottom-nav';
import { Cover } from '@/components/cover';
import { allSongs, trendingSongs } from '@/lib/mock-data';
import { storage } from '@/lib/storage';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(storage.getRecentSearches());
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allSongs.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album?.toLowerCase().includes(q) ||
        (q.includes('wonder') && s.id === 'wonderwall')
    );
  }, [query]);

  const handleSelectRecent = (q: string) => {
    setQuery(q);
  };

  return (
    <>
      <CrossLitHalos intensity="low" />
      <StatusBar />

      <h1 className="absolute top-[60px] left-4 text-2xl font-medium tracking-tight text-text">Search</h1>

      {/* Search input */}
      <div className="absolute top-[100px] left-4 right-4 flex items-center gap-2.5 bg-text/[0.05] border border-text/[0.08] rounded-2xl px-3.5 h-12">
        <SearchIcon size={18} className="text-text/55" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onBlur={() => query.trim() && storage.addRecentSearch(query.trim())}
          placeholder="Search songs, artists, albums"
          className="flex-1 bg-transparent text-[15px] text-text placeholder:text-text/45 outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear"
            className="w-5 h-5 rounded-full bg-text/20 flex items-center justify-center"
          >
            <X size={10} strokeWidth={3} className="text-bg-primary" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="absolute top-[170px] bottom-[110px] left-0 right-0 overflow-y-auto px-4 no-scrollbar">
        {!query ? (
          <div className="flex flex-col gap-6 pb-4 pt-2">
            {recents.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={12} className="text-text/55" />
                  <h2 className="text-[11px] uppercase tracking-wider text-text/55 font-medium">Recent</h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recents.map(r => (
                    <button
                      key={r}
                      onClick={() => handleSelectRecent(r)}
                      className="px-3 py-1.5 rounded-2xl bg-text/[0.04] border border-text/[0.08] text-xs text-text"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={12} className="text-amber" />
                <h2 className="text-[11px] uppercase tracking-wider text-text/55 font-medium">Trending</h2>
              </div>
              <div className="flex flex-col">
                {trendingSongs.map((s, idx) => (
                  <Link
                    key={s.id}
                    href={`/chord/${s.id}`}
                    className="flex items-center gap-3 py-2.5 border-b border-text/[0.06] active:bg-text/[0.03]"
                  >
                    <span className="text-base font-medium text-amber/60 tabular-nums w-5">{idx + 1}</span>
                    <Cover variant={s.cover} size={40} rounded="rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text truncate">{s.title}</div>
                      <div className="text-[11px] text-text/55 truncate">{s.artist}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <>
            <div className="text-[11px] uppercase tracking-wider text-text/50 mb-2 mt-2">
              {results.length} {results.length === 1 ? 'song' : 'songs'}
            </div>
            <div className="flex flex-col">
              {results.map(s => {
                const saved = storage.isSongSaved(s.id);
                return (
                  <Link
                    key={s.id}
                    href={`/chord/${s.id}`}
                    onClick={() => storage.addRecentSearch(query.trim())}
                    className="flex items-center gap-3 py-2.5 border-b border-text/[0.06] active:bg-text/[0.03]"
                  >
                    <Cover variant="gradient-1" size={40} rounded="rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text truncate">{s.title}</div>
                      <div className="text-[11px] text-text/55 truncate flex items-center gap-1">
                        {s.artist}
                        {saved && (
                          <>
                            <Heart size={10} className="text-amber fill-amber" fill="#FFD89A" />
                            <span className="text-amber">in library</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
              {results.length === 0 && (
                <div className="text-center py-8 text-xs text-text/45">
                  No results. Try a different search.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom hint */}
      {!query && (
        <Link
          href="/"
          className="absolute bottom-[88px] left-0 right-0 text-center text-[11px] text-text/55 px-4"
        >
          Don&apos;t see it? Tap <strong className="text-amber font-medium">home</strong> to identify by listening
        </Link>
      )}

      <BottomNav />
      <HomeIndicator />
    </>
  );
}
